import { SearchParams, SearchResult, PricePoint } from '@/types/search';
import { resolveDestination } from '../geo/resolve-destination';
import { resolveRegionAirports } from '../geo/region-map';
import { getAirportInfo } from '../geo/airport-lookup';
import { getDateRanges, generateSearchDates, DateRange } from './date-ranges';
import { mergeAndDeduplicateResults } from './result-merger';
import { searchFlights } from '../serpapi/flight-search';
import { searchFlightsTequila } from '../tequila/flight-search';
import { getFlightOffers } from '../amadeus/flight-offers';
import { AmadeusFlightOffer } from '@/types/amadeus';
import { savePriceSnapshots, updatePriceSummary } from '../supabase/price-cache';
import { dealRating } from '../utils/deal-rating';

// ---------------------------------------------------------------------------
// Demo data — shown when SerpAPI key is not configured or returns no results
// ---------------------------------------------------------------------------

// prettier-ignore
const DEMO_DESTINATIONS = [
  // Europe
  { iataCode: 'LHR', city: 'London',        country: 'United Kingdom', basePrice: 420,  airline: 'British Airways',   airlineCode: 'BA', stops: 0, duration: 'PT7H' },
  { iataCode: 'CDG', city: 'Paris',          country: 'France',         basePrice: 390,  airline: 'Air France',        airlineCode: 'AF', stops: 0, duration: 'PT7H30M' },
  { iataCode: 'FCO', city: 'Rome',           country: 'Italy',          basePrice: 450,  airline: 'Lufthansa',         airlineCode: 'LH', stops: 1, duration: 'PT10H' },
  { iataCode: 'AMS', city: 'Amsterdam',      country: 'Netherlands',    basePrice: 410,  airline: 'KLM',               airlineCode: 'KL', stops: 0, duration: 'PT7H45M' },
  // East Asia
  { iataCode: 'NRT', city: 'Tokyo',          country: 'Japan',          basePrice: 780,  airline: 'Japan Airlines',    airlineCode: 'JL', stops: 0, duration: 'PT14H' },
  { iataCode: 'ICN', city: 'Seoul',          country: 'South Korea',    basePrice: 820,  airline: 'Korean Air',        airlineCode: 'KE', stops: 0, duration: 'PT14H30M' },
  // Southeast Asia
  { iataCode: 'BKK', city: 'Bangkok',        country: 'Thailand',       basePrice: 650,  airline: 'Thai Airways',      airlineCode: 'TG', stops: 1, duration: 'PT18H' },
  { iataCode: 'SIN', city: 'Singapore',      country: 'Singapore',      basePrice: 720,  airline: 'Singapore Airlines',airlineCode: 'SQ', stops: 0, duration: 'PT18H30M' },
  // Middle East
  { iataCode: 'DXB', city: 'Dubai',          country: 'UAE',            basePrice: 560,  airline: 'Emirates',          airlineCode: 'EK', stops: 0, duration: 'PT12H' },
  // Latin America
  { iataCode: 'MEX', city: 'Mexico City',    country: 'Mexico',         basePrice: 280,  airline: 'American Airlines', airlineCode: 'AA', stops: 0, duration: 'PT5H30M' },
  { iataCode: 'GRU', city: 'São Paulo',      country: 'Brazil',         basePrice: 510,  airline: 'LATAM Airlines',    airlineCode: 'LA', stops: 1, duration: 'PT10H' },
  // Oceania
  { iataCode: 'SYD', city: 'Sydney',         country: 'Australia',      basePrice: 1100, airline: 'Qantas',            airlineCode: 'QF', stops: 1, duration: 'PT21H' },

  // Western Europe (extended)
  { iataCode: 'MAD', city: 'Madrid',         country: 'Spain',          basePrice: 400,  airline: 'Iberia',            airlineCode: 'IB', stops: 0, duration: 'PT8H' },
  { iataCode: 'BCN', city: 'Barcelona',      country: 'Spain',          basePrice: 415,  airline: 'Iberia',            airlineCode: 'IB', stops: 0, duration: 'PT8H15M' },
  { iataCode: 'FRA', city: 'Frankfurt',      country: 'Germany',        basePrice: 430,  airline: 'Lufthansa',         airlineCode: 'LH', stops: 0, duration: 'PT8H30M' },
  { iataCode: 'LIS', city: 'Lisbon',         country: 'Portugal',       basePrice: 395,  airline: 'TAP Air Portugal',  airlineCode: 'TP', stops: 0, duration: 'PT7H45M' },
  { iataCode: 'ATH', city: 'Athens',         country: 'Greece',         basePrice: 460,  airline: 'Aegean Airlines',   airlineCode: 'A3', stops: 1, duration: 'PT11H' },
  { iataCode: 'VIE', city: 'Vienna',         country: 'Austria',        basePrice: 445,  airline: 'Austrian Airlines', airlineCode: 'OS', stops: 1, duration: 'PT10H30M' },
  { iataCode: 'MUC', city: 'Munich',         country: 'Germany',        basePrice: 435,  airline: 'Lufthansa',         airlineCode: 'LH', stops: 0, duration: 'PT8H45M' },
  { iataCode: 'ZRH', city: 'Zurich',         country: 'Switzerland',    basePrice: 480,  airline: 'Swiss',             airlineCode: 'LX', stops: 0, duration: 'PT9H' },
  { iataCode: 'DUB', city: 'Dublin',         country: 'Ireland',        basePrice: 405,  airline: 'Aer Lingus',        airlineCode: 'EI', stops: 0, duration: 'PT6H30M' },
  { iataCode: 'BRU', city: 'Brussels',       country: 'Belgium',        basePrice: 420,  airline: 'Brussels Airlines', airlineCode: 'SN', stops: 0, duration: 'PT7H30M' },
  { iataCode: 'NAP', city: 'Naples',         country: 'Italy',          basePrice: 460,  airline: 'Lufthansa',         airlineCode: 'LH', stops: 1, duration: 'PT10H30M' },
  { iataCode: 'OPO', city: 'Porto',          country: 'Portugal',       basePrice: 400,  airline: 'TAP Air Portugal',  airlineCode: 'TP', stops: 0, duration: 'PT7H30M' },
  // Scandinavia
  { iataCode: 'ARN', city: 'Stockholm',      country: 'Sweden',         basePrice: 470,  airline: 'SAS',               airlineCode: 'SK', stops: 1, duration: 'PT10H' },
  { iataCode: 'CPH', city: 'Copenhagen',     country: 'Denmark',        basePrice: 455,  airline: 'SAS',               airlineCode: 'SK', stops: 1, duration: 'PT9H45M' },
  { iataCode: 'OSL', city: 'Oslo',           country: 'Norway',         basePrice: 465,  airline: 'SAS',               airlineCode: 'SK', stops: 1, duration: 'PT10H15M' },
  { iataCode: 'HEL', city: 'Helsinki',       country: 'Finland',        basePrice: 475,  airline: 'Finnair',           airlineCode: 'AY', stops: 1, duration: 'PT10H30M' },
  // Eastern Europe
  { iataCode: 'WAW', city: 'Warsaw',         country: 'Poland',         basePrice: 430,  airline: 'LOT Polish Airlines',airlineCode: 'LO', stops: 1, duration: 'PT10H' },
  { iataCode: 'PRG', city: 'Prague',         country: 'Czech Republic', basePrice: 440,  airline: 'Czech Airlines',    airlineCode: 'OK', stops: 1, duration: 'PT10H30M' },
  { iataCode: 'BUD', city: 'Budapest',       country: 'Hungary',        basePrice: 445,  airline: 'Wizz Air',          airlineCode: 'W6', stops: 1, duration: 'PT10H45M' },
  { iataCode: 'BEG', city: 'Belgrade',       country: 'Serbia',         basePrice: 450,  airline: 'Air Serbia',        airlineCode: 'JU', stops: 1, duration: 'PT11H' },
  // East Asia (extended)
  { iataCode: 'KIX', city: 'Osaka',          country: 'Japan',          basePrice: 760,  airline: 'Japan Airlines',    airlineCode: 'JL', stops: 0, duration: 'PT14H30M' },
  { iataCode: 'HKG', city: 'Hong Kong',      country: 'Hong Kong',      basePrice: 750,  airline: 'Cathay Pacific',    airlineCode: 'CX', stops: 0, duration: 'PT16H' },
  { iataCode: 'TPE', city: 'Taipei',         country: 'Taiwan',         basePrice: 760,  airline: 'EVA Air',           airlineCode: 'BR', stops: 0, duration: 'PT16H30M' },
  { iataCode: 'PVG', city: 'Shanghai',       country: 'China',          basePrice: 790,  airline: 'Air China',         airlineCode: 'CA', stops: 0, duration: 'PT15H' },
  { iataCode: 'PEK', city: 'Beijing',        country: 'China',          basePrice: 800,  airline: 'Air China',         airlineCode: 'CA', stops: 0, duration: 'PT14H45M' },
  // Southeast Asia (extended)
  { iataCode: 'HKT', city: 'Phuket',         country: 'Thailand',       basePrice: 670,  airline: 'Thai Airways',      airlineCode: 'TG', stops: 1, duration: 'PT19H' },
  { iataCode: 'CNX', city: 'Chiang Mai',     country: 'Thailand',       basePrice: 660,  airline: 'Thai Airways',      airlineCode: 'TG', stops: 1, duration: 'PT19H30M' },
  { iataCode: 'KUL', city: 'Kuala Lumpur',   country: 'Malaysia',       basePrice: 680,  airline: 'Malaysia Airlines', airlineCode: 'MH', stops: 1, duration: 'PT19H' },
  { iataCode: 'DPS', city: 'Bali',           country: 'Indonesia',      basePrice: 700,  airline: 'Singapore Airlines',airlineCode: 'SQ', stops: 1, duration: 'PT20H' },
  { iataCode: 'MNL', city: 'Manila',         country: 'Philippines',    basePrice: 660,  airline: 'Philippine Airlines',airlineCode: 'PR', stops: 1, duration: 'PT19H30M' },
  { iataCode: 'SGN', city: 'Ho Chi Minh City',country: 'Vietnam',       basePrice: 640,  airline: 'Vietnam Airlines',  airlineCode: 'VN', stops: 1, duration: 'PT19H' },
  { iataCode: 'HAN', city: 'Hanoi',          country: 'Vietnam',        basePrice: 635,  airline: 'Vietnam Airlines',  airlineCode: 'VN', stops: 1, duration: 'PT19H30M' },
  // South Asia
  { iataCode: 'DEL', city: 'New Delhi',      country: 'India',          basePrice: 580,  airline: 'Air India',         airlineCode: 'AI', stops: 1, duration: 'PT15H' },
  { iataCode: 'BOM', city: 'Mumbai',         country: 'India',          basePrice: 570,  airline: 'Air India',         airlineCode: 'AI', stops: 1, duration: 'PT15H30M' },
  { iataCode: 'BLR', city: 'Bangalore',      country: 'India',          basePrice: 590,  airline: 'Air India',         airlineCode: 'AI', stops: 1, duration: 'PT16H' },
  { iataCode: 'CMB', city: 'Colombo',        country: 'Sri Lanka',      basePrice: 620,  airline: 'SriLankan Airlines',airlineCode: 'UL', stops: 1, duration: 'PT17H' },
  { iataCode: 'KTM', city: 'Kathmandu',      country: 'Nepal',          basePrice: 610,  airline: 'Air India',         airlineCode: 'AI', stops: 1, duration: 'PT16H30M' },
  // Middle East (extended)
  { iataCode: 'AUH', city: 'Abu Dhabi',      country: 'UAE',            basePrice: 555,  airline: 'Etihad Airways',    airlineCode: 'EY', stops: 0, duration: 'PT12H15M' },
  { iataCode: 'DOH', city: 'Doha',           country: 'Qatar',          basePrice: 540,  airline: 'Qatar Airways',     airlineCode: 'QR', stops: 0, duration: 'PT12H30M' },
  { iataCode: 'AMM', city: 'Amman',          country: 'Jordan',         basePrice: 520,  airline: 'Royal Jordanian',   airlineCode: 'RJ', stops: 1, duration: 'PT13H' },
  { iataCode: 'TLV', city: 'Tel Aviv',       country: 'Israel',         basePrice: 510,  airline: 'El Al',             airlineCode: 'LY', stops: 1, duration: 'PT12H30M' },
  { iataCode: 'IST', city: 'Istanbul',       country: 'Turkey',         basePrice: 490,  airline: 'Turkish Airlines',  airlineCode: 'TK', stops: 0, duration: 'PT11H' },
  // Africa
  { iataCode: 'JNB', city: 'Johannesburg',   country: 'South Africa',   basePrice: 820,  airline: 'South African Airways',airlineCode: 'SA', stops: 1, duration: 'PT18H' },
  { iataCode: 'CPT', city: 'Cape Town',      country: 'South Africa',   basePrice: 840,  airline: 'South African Airways',airlineCode: 'SA', stops: 1, duration: 'PT19H' },
  { iataCode: 'CAI', city: 'Cairo',          country: 'Egypt',          basePrice: 560,  airline: 'EgyptAir',          airlineCode: 'MS', stops: 1, duration: 'PT13H' },
  { iataCode: 'NBO', city: 'Nairobi',        country: 'Kenya',          basePrice: 750,  airline: 'Kenya Airways',     airlineCode: 'KQ', stops: 1, duration: 'PT16H' },
  { iataCode: 'CMN', city: 'Casablanca',     country: 'Morocco',        basePrice: 480,  airline: 'Royal Air Maroc',   airlineCode: 'AT', stops: 1, duration: 'PT10H30M' },
  { iataCode: 'ADD', city: 'Addis Ababa',    country: 'Ethiopia',       basePrice: 720,  airline: 'Ethiopian Airlines',airlineCode: 'ET', stops: 1, duration: 'PT15H30M' },
  { iataCode: 'ACC', city: 'Accra',          country: 'Ghana',          basePrice: 700,  airline: 'Delta Air Lines',   airlineCode: 'DL', stops: 1, duration: 'PT14H' },
  { iataCode: 'DKR', city: 'Dakar',          country: 'Senegal',        basePrice: 680,  airline: 'Air France',        airlineCode: 'AF', stops: 1, duration: 'PT13H30M' },
  // Latin America (extended)
  { iataCode: 'CUN', city: 'Cancún',         country: 'Mexico',         basePrice: 260,  airline: 'American Airlines', airlineCode: 'AA', stops: 0, duration: 'PT4H30M' },
  { iataCode: 'GIG', city: 'Rio de Janeiro', country: 'Brazil',         basePrice: 520,  airline: 'LATAM Airlines',    airlineCode: 'LA', stops: 1, duration: 'PT10H30M' },
  { iataCode: 'BOG', city: 'Bogotá',         country: 'Colombia',       basePrice: 340,  airline: 'Avianca',           airlineCode: 'AV', stops: 1, duration: 'PT7H' },
  { iataCode: 'LIM', city: 'Lima',           country: 'Peru',           basePrice: 380,  airline: 'LATAM Airlines',    airlineCode: 'LA', stops: 1, duration: 'PT8H' },
  { iataCode: 'SCL', city: 'Santiago',       country: 'Chile',          basePrice: 490,  airline: 'LATAM Airlines',    airlineCode: 'LA', stops: 1, duration: 'PT10H' },
  { iataCode: 'EZE', city: 'Buenos Aires',   country: 'Argentina',      basePrice: 530,  airline: 'Aerolíneas Argentinas',airlineCode: 'AR', stops: 1, duration: 'PT11H' },
  { iataCode: 'PTY', city: 'Panama City',    country: 'Panama',         basePrice: 310,  airline: 'Copa Airlines',     airlineCode: 'CM', stops: 0, duration: 'PT5H' },
  { iataCode: 'SJO', city: 'San José',       country: 'Costa Rica',     basePrice: 295,  airline: 'United Airlines',   airlineCode: 'UA', stops: 0, duration: 'PT5H30M' },
  // Caribbean
  { iataCode: 'MBJ', city: 'Montego Bay',    country: 'Jamaica',        basePrice: 280,  airline: 'American Airlines', airlineCode: 'AA', stops: 0, duration: 'PT4H' },
  { iataCode: 'PUJ', city: 'Punta Cana',     country: 'Dominican Republic',basePrice: 260,airline: 'JetBlue',          airlineCode: 'B6', stops: 0, duration: 'PT4H30M' },
  { iataCode: 'SJU', city: 'San Juan',       country: 'Puerto Rico',    basePrice: 240,  airline: 'JetBlue',           airlineCode: 'B6', stops: 0, duration: 'PT3H30M' },
  { iataCode: 'NAS', city: 'Nassau',         country: 'Bahamas',        basePrice: 220,  airline: 'American Airlines', airlineCode: 'AA', stops: 0, duration: 'PT3H' },
  { iataCode: 'AUA', city: 'Aruba',          country: 'Aruba',          basePrice: 290,  airline: 'American Airlines', airlineCode: 'AA', stops: 0, duration: 'PT4H' },
  { iataCode: 'BGI', city: 'Bridgetown',     country: 'Barbados',       basePrice: 350,  airline: 'JetBlue',           airlineCode: 'B6', stops: 0, duration: 'PT5H' },
  // Oceania (extended)
  { iataCode: 'MEL', city: 'Melbourne',      country: 'Australia',      basePrice: 1080, airline: 'Qantas',            airlineCode: 'QF', stops: 1, duration: 'PT21H30M' },
  { iataCode: 'BNE', city: 'Brisbane',       country: 'Australia',      basePrice: 1090, airline: 'Qantas',            airlineCode: 'QF', stops: 1, duration: 'PT22H' },
  { iataCode: 'AKL', city: 'Auckland',       country: 'New Zealand',    basePrice: 1150, airline: 'Air New Zealand',   airlineCode: 'NZ', stops: 1, duration: 'PT22H30M' },
  { iataCode: 'NAN', city: 'Nadi',           country: 'Fiji',           basePrice: 1050, airline: 'Fiji Airways',      airlineCode: 'FJ', stops: 1, duration: 'PT20H' },
  // Central Asia
  { iataCode: 'TAS', city: 'Tashkent',       country: 'Uzbekistan',     basePrice: 960,  airline: 'Uzbekistan Airways',airlineCode: 'HY', stops: 1, duration: 'PT14H30M' },
  { iataCode: 'ALA', city: 'Almaty',         country: 'Kazakhstan',     basePrice: 990,  airline: 'Air Astana',        airlineCode: 'KC', stops: 1, duration: 'PT15H' },
  { iataCode: 'FRU', city: 'Bishkek',        country: 'Kyrgyzstan',     basePrice: 1010, airline: 'Turkish Airlines',  airlineCode: 'TK', stops: 1, duration: 'PT15H30M' },
  { iataCode: 'DYU', city: 'Dushanbe',       country: 'Tajikistan',     basePrice: 1040, airline: 'Turkish Airlines',  airlineCode: 'TK', stops: 1, duration: 'PT15H45M' },
  { iataCode: 'ASB', city: 'Ashgabat',       country: 'Turkmenistan',   basePrice: 1080, airline: 'Turkmenistan Airlines',airlineCode: 'T5', stops: 1, duration: 'PT16H' },
  // North Africa (extended)
  { iataCode: 'TUN', city: 'Tunis',          country: 'Tunisia',        basePrice: 690,  airline: 'Tunisair',          airlineCode: 'TU', stops: 1, duration: 'PT10H' },
  { iataCode: 'ALG', city: 'Algiers',        country: 'Algeria',        basePrice: 720,  airline: 'Air Algérie',       airlineCode: 'AH', stops: 1, duration: 'PT10H30M' },
  { iataCode: 'HRG', city: 'Hurghada',       country: 'Egypt',          basePrice: 650,  airline: 'EgyptAir',          airlineCode: 'MS', stops: 1, duration: 'PT12H' },
];

function makeDemoHistory(basePrice: number, seed: number): PricePoint[] {
  const points: PricePoint[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const seasonal = Math.sin((d.getMonth() / 12) * Math.PI * 2 - 1.2) * 0.15;
    const destVariance = Math.sin(seed * 0.37 + i * 0.9) * 0.07;
    points.push({ month, price: Math.round(basePrice * (1 + seasonal + destVariance)) });
  }
  return points;
}

const DEST_DAY_OFFSETS: Record<string, number> = {
  // Western Europe
  LHR: 12, CDG: 8,  FCO: 10, AMS: 9,  MAD: 14, BCN: 17, FRA: 11, LIS: 7,
  ATH: 20, VIE: 13, MUC: 6,  ZRH: 18, DUB: 15, BRU: 22, NAP: 9,  OPO: 16,
  // Scandinavia
  ARN: 16, CPH: 9,  OSL: 21, HEL: 13,
  // Eastern Europe
  WAW: 11, PRG: 18, BUD: 7,  BEG: 24,
  // East Asia
  NRT: 15, KIX: 8,  ICN: 13, HKG: 18, TPE: 21, PVG: 10, PEK: 17,
  // Southeast Asia
  BKK: 9,  HKT: 22, CNX: 14, SIN: 19, KUL: 11, DPS: 23, MNL: 14, SGN: 7, HAN: 18,
  // South Asia
  DEL: 12, BOM: 6,  BLR: 19, CMB: 24, KTM: 10,
  // Middle East
  DXB: 11, AUH: 20, DOH: 8,  AMM: 15, TLV: 22, IST: 9,
  // Africa
  JNB: 17, CPT: 24, CAI: 11, NBO: 8,  CMN: 20, ADD: 13, ACC: 16, DKR: 7,
  // Latin America
  MEX: 14, CUN: 8,  GRU: 22, GIG: 17, BOG: 10, LIM: 21, SCL: 12, EZE: 26, PTY: 7, SJO: 19,
  // Caribbean
  MBJ: 14, PUJ: 20, SJU: 9,  NAS: 16, AUA: 23, BGI: 11,
  // Oceania
  SYD: 17, MEL: 20, BNE: 9,  AKL: 24, NAN: 14,
  // Central Asia
  TAS: 11, ALA: 16, FRU: 22, DYU: 8,  ASB: 19,
  // North Africa (extended)
  TUN: 13, ALG: 7,  HRG: 21,
};

function makeDemoResults(
  origin: string,
  destinationCodes: string[],
  dateRanges: DateRange[],
  tripDays: number
): SearchResult[] {
  const pool = DEMO_DESTINATIONS.filter((d) => destinationCodes.includes(d.iataCode));
  const selected = pool.length > 0 ? pool : DEMO_DESTINATIONS;

  return selected.slice(0, 4).map((dest, i) => {
    const range = dateRanges[i % Math.max(dateRanges.length, 1)];
    const rangeStart = new Date((range?.start ?? new Date().toISOString().split('T')[0]) + 'T00:00:00');
    const day = DEST_DAY_OFFSETS[dest.iataCode] ?? (8 + (i * 3) % 15);
    rangeStart.setDate(day);
    const depDate = rangeStart.toISOString().split('T')[0];
    const retDate = new Date(rangeStart.getTime() + tripDays * 86400000).toISOString().split('T')[0];

    const monthIndex = rangeStart.getMonth();
    const seasonalFactor = [1.05, 1.0, 1.02, 0.98, 1.0, 1.15, 1.2, 1.18, 1.05, 0.97, 0.95, 1.1][monthIndex];
    const destFactor = 1 + Math.sin(i * 1.7) * 0.06;
    const price = Math.round(dest.basePrice * seasonalFactor * destFactor);

    const history = makeDemoHistory(dest.basePrice, i);
    const historicalLow = Math.min(...history.map((p) => p.price));
    const avg12m = history.reduce((s, p) => s + p.price, 0) / history.length;
    const { rating, percent } = dealRating(price, historicalLow);

    return {
      id: `demo-${origin}-${dest.iataCode}-${i}`,
      origin,
      destination: dest.iataCode,
      destinationName: `${dest.city}, ${dest.country}`,
      destinationCity: dest.city,
      destinationCountry: dest.country,
      departureDate: depDate,
      returnDate: retDate,
      price,
      currency: 'USD',
      airline: dest.airline,
      airlineCode: dest.airlineCode,
      stops: dest.stops,
      duration: dest.duration,
      historicalLow,
      avg12m,
      dealRating: rating,
      dealPercent: percent,
      priceHistory: history,
      dataSource: 'demo',
    } as SearchResult;
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function calcHistory(pricePoints: PricePoint[]): { historicalLow: number | null; avg12m: number | null } {
  if (pricePoints.length === 0) return { historicalLow: null, avg12m: null };
  const prices = pricePoints.map((p) => p.price);
  return {
    historicalLow: Math.min(...prices),
    avg12m: prices.reduce((a, b) => a + b, 0) / prices.length,
  };
}

async function cachePriceData(
  origin: string,
  destination: string,
  pricePoints: PricePoint[],
  currentPrice: number
): Promise<void> {
  try {
    if (pricePoints.length > 0) {
      await savePriceSnapshots(origin, destination, pricePoints, 'serpapi');
      await updatePriceSummary(origin, destination, pricePoints, currentPrice);
    }
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await savePriceSnapshots(origin, destination, [{ month: currentMonth, price: currentPrice }], 'user_search');
  } catch {
    // Supabase not configured — skip caching
  }
}

function mapAmadeusOffers(
  offers: AmadeusFlightOffer[],
  fallbackDeparture: string,
  fallbackReturn?: string
): import('../serpapi/flight-search').FlightResult[] {
  return offers
    .filter((o) => parseFloat(o.price.total) > 0)
    .map((o) => {
      const outbound = o.itineraries[0];
      const airlineCode = o.validatingAirlineCodes[0] ?? '';
      const depAt = outbound?.segments[0]?.departure?.at ?? '';
      const depDate = depAt ? depAt.split('T')[0] : fallbackDeparture;
      const inbound = o.itineraries[1];
      const retAt = inbound?.segments[0]?.departure?.at ?? '';
      const retDate = retAt ? retAt.split('T')[0] : fallbackReturn;
      return {
        price: parseFloat(o.price.total),
        airline: airlineCode,
        airlineCode,
        stops: Math.max(0, (outbound?.segments?.length ?? 1) - 1),
        duration: outbound?.duration ?? 'PT0H',
        departureDate: depDate,
        returnDate: retDate,
      };
    })
    .sort((a, b) => a.price - b.price);
}

async function searchFlightsWithFallback(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string
): Promise<{ flights: import('../serpapi/flight-search').FlightResult[]; pricePoints: PricePoint[]; dataSource: 'tequila' | 'serpapi' | 'amadeus' }> {
  const tequila = await searchFlightsTequila(origin, destination, departureDate, returnDate);
  if (tequila.flights.length > 0) {
    return { ...tequila, dataSource: 'tequila' };
  }
  const serp = await searchFlights(origin, destination, departureDate, returnDate);
  if (serp.flights.length > 0) {
    return { ...serp, dataSource: 'serpapi' };
  }
  const amadeusOffers = await getFlightOffers(origin, destination, departureDate, returnDate);
  const amadeusFlights = mapAmadeusOffers(amadeusOffers, departureDate, returnDate);
  return { flights: amadeusFlights, pricePoints: [], dataSource: 'amadeus' };
}

function buildResult(
  origin: string,
  destCode: string,
  flight: { price: number; airline: string; airlineCode: string; stops: number; duration: string; departureDate: string; returnDate?: string; bookingUrl?: string; bookingToken?: string },
  pricePoints: PricePoint[],
  dataSource: string = 'serpapi'
): SearchResult {
  const info = getAirportInfo(destCode);
  const { historicalLow, avg12m } = calcHistory(pricePoints);
  const { rating, percent } = dealRating(flight.price, historicalLow);

  return {
    id: `${origin}-${destCode}-${flight.departureDate}`,
    origin,
    destination: destCode,
    destinationName: [info.city, info.country].filter(Boolean).join(', '),
    destinationCity: info.city,
    destinationCountry: info.country,
    departureDate: flight.departureDate,
    returnDate: flight.returnDate,
    price: flight.price,
    currency: 'USD',
    airline: flight.airline,
    airlineCode: flight.airlineCode,
    stops: flight.stops,
    duration: flight.duration,
    bookingUrl: flight.bookingUrl,
    bookingToken: flight.bookingToken,
    historicalLow,
    avg12m,
    dealRating: rating,
    dealPercent: percent,
    priceHistory: pricePoints,
    dataSource,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function orchestrateSearch(params: SearchParams): Promise<SearchResult[]> {
  const { origin, destination, flexibility, customDateStart, customDateEnd, tripDays = 7 } = params;

  const destinationCodes = await resolveDestination(destination);
  if (!destinationCodes.length) return [];

  const dateRanges = getDateRanges(flexibility, customDateStart, customDateEnd);
  if (!dateRanges.length) return [];

  const isMultiDest = !!resolveRegionAirports(destination) || destinationCodes.length > 1;
  const allResults: SearchResult[] = [];

  // Single-dest: weekly scan for fine-grained cheapest-day detection.
  // Multi-dest: monthly scan (one date per month) to keep API usage reasonable across 8 destinations.
  const searchDates = generateSearchDates(flexibility, customDateStart, customDateEnd, isMultiDest ? 28 : 7);
  if (!searchDates.length) return makeDemoResults(origin, destinationCodes, dateRanges, tripDays);

  if (isMultiDest) {
    // Region/multi-destination: scan one date per month for each destination, push cheapest
    // per search. mergeAndDeduplicateResults keeps one per destination+month for date variety.
    // Cap at 6 destinations — airports are ordered by country diversity so first 6 span different cities.
    const targets = destinationCodes.slice(0, 6);

    await Promise.all(
      targets.map(async (destCode) => {
        const searches = await Promise.all(
          searchDates.map((dep) => searchFlightsWithFallback(origin, destCode, dep, addDays(dep, tripDays)))
        );

        const combinedPricePoints: PricePoint[] = [];
        for (const { flights, pricePoints, dataSource } of searches) {
          const best = flights[0];
          if (!best) continue;
          allResults.push(buildResult(origin, destCode, best, pricePoints, dataSource));
          combinedPricePoints.push(...pricePoints);
        }

        if (combinedPricePoints.length > 0) {
          const prices = combinedPricePoints.map((p) => p.price);
          cachePriceData(origin, destCode, combinedPricePoints, Math.min(...prices));
        }
      })
    );
  } else {
    // Single destination: scan every week, return one card per week so user sees full price curve.
    const destCode = destinationCodes[0];

    const searches = await Promise.all(
      searchDates.map((dep) => searchFlightsWithFallback(origin, destCode, dep, addDays(dep, tripDays)))
    );

    for (const { flights, pricePoints, dataSource } of searches) {
      const best = flights[0];
      if (!best) continue;
      allResults.push(buildResult(origin, destCode, best, pricePoints, dataSource));
      cachePriceData(origin, destCode, pricePoints, best.price);
    }
  }

  const merged = mergeAndDeduplicateResults(allResults);

  if (merged.length === 0) {
    return makeDemoResults(origin, destinationCodes, dateRanges, tripDays);
  }

  return merged;
}
