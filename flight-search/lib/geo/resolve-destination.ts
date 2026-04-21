import { searchLocations } from '../amadeus/locations';
import { resolveRegionAirports, REGIONS } from './region-map';

// All airports across all regions — used for "anywhere"
const ALL_REGION_AIRPORTS = Array.from(
  new Set(Object.values(REGIONS).flatMap((r) => r.airports))
);

// Fallback lookup for popular cities — used when Amadeus is not configured
// prettier-ignore
const CITY_TO_IATA: Record<string, string[]> = {
  'tokyo': ['NRT', 'HND'],        'osaka': ['KIX'],
  'bali': ['DPS'],                'jakarta': ['CGK'],
  'paris': ['CDG', 'ORY'],        'london': ['LHR', 'LGW'],
  'new york': ['JFK', 'EWR'],     'los angeles': ['LAX'],
  'barcelona': ['BCN'],           'madrid': ['MAD'],
  'phuket': ['HKT'],              'bangkok': ['BKK', 'DMK'],
  'dubai': ['DXB'],               'abu dhabi': ['AUH'],
  'seoul': ['ICN'],               'singapore': ['SIN'],
  'rome': ['FCO'],                'milan': ['MXP', 'LIN'],
  'amsterdam': ['AMS'],           'frankfurt': ['FRA'],
  'mexico city': ['MEX'],         'cancun': ['CUN'],
  'são paulo': ['GRU'],           'rio de janeiro': ['GIG'],
  'sydney': ['SYD'],              'melbourne': ['MEL'],
  'istanbul': ['IST'],            'athens': ['ATH'],
  'lisbon': ['LIS'],              'prague': ['PRG'],
  'vienna': ['VIE'],              'zurich': ['ZRH'],
  'kuala lumpur': ['KUL'],        'manila': ['MNL'],
  'johannesburg': ['JNB'],        'cape town': ['CPT'],
  'toronto': ['YYZ'],             'vancouver': ['YVR'],
  'chicago': ['ORD', 'MDW'],      'miami': ['MIA'],
  'san francisco': ['SFO'],       'seattle': ['SEA'],
  'lima': ['LIM'],                'santiago': ['SCL'],
  'buenos aires': ['EZE'],        'bogota': ['BOG'],
  'new delhi': ['DEL'],           'mumbai': ['BOM'],
  'cairo': ['CAI'],               'nairobi': ['NBO'],
  'auckland': ['AKL'],            'honolulu': ['HNL'],
  'denver': ['DEN'],              'dallas': ['DFW'],
};

export async function resolveDestination(destination: string): Promise<string[]> {
  const lower = destination.toLowerCase().trim();

  // "anywhere" → every region airport
  if (lower === 'anywhere') return ALL_REGION_AIRPORTS;

  // Check if it's a region
  const regionAirports = resolveRegionAirports(destination);
  if (regionAirports) return regionAirports;

  // Check if it looks like an IATA code (3 uppercase letters)
  if (/^[A-Z]{3}$/.test(destination)) {
    return [destination];
  }

  // Local city lookup — works without any API key
  if (CITY_TO_IATA[lower]) {
    return CITY_TO_IATA[lower];
  }

  // Search via Amadeus locations API
  try {
    const locations = await searchLocations(destination);
    if (locations.length === 0) return [];

    // Return up to 5 airport/city codes
    return locations
      .slice(0, 5)
      .map((loc) => loc.iataCode)
      .filter(Boolean);
  } catch {
    return [];
  }
}
