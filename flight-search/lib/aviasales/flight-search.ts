/**
 * Aviasales / Travelpayouts Prices API
 *
 * Free token — sign up at https://www.travelpayouts.com/developers/api
 * (Account → API → copy your token)
 *
 * Returns cached cheapest prices from 750+ airlines, refreshed every ~20 min.
 * Perfect for price-discovery / "find cheap dates" use cases.
 */

import crypto from 'crypto';
import { FlightResult } from '../serpapi/flight-search';
import { PricePoint } from '@/types/search';

const AVIASALES_TOKEN = process.env.AVIASALES_TOKEN || '';
const TRAVELPAYOUTS_MARKER = process.env.TRAVELPAYOUTS_MARKER || '';
const REALTIME_HOST = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost';

function minutesToIsoDuration(minutes: number): string {
  if (!minutes) return 'PT0H';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `PT${h}H${m}M` : `PT${h}H`;
}

interface AviasalesResult {
  origin: string;
  destination: string;
  origin_airport: string;
  destination_airport: string;
  price: number;
  airline: string;
  flight_number: string;
  departure_at: string;
  return_at?: string;
  transfers: number;
  return_transfers?: number;
  duration_to: number;
  duration_back?: number;
  link: string;
}

export async function searchFlightsAviasales(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string
): Promise<{ flights: FlightResult[]; pricePoints: PricePoint[] }> {
  if (!AVIASALES_TOKEN) return { flights: [], pricePoints: [] };

  try {
    const url = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
    url.searchParams.set('origin', origin);
    url.searchParams.set('destination', destination);
    // Aviasales prices_for_dates only has cached data by month — YYYY-MM-DD returns empty
    url.searchParams.set('departure_at', departureDate.slice(0, 7));
    url.searchParams.set('sorting', 'price');
    url.searchParams.set('currency', 'usd');
    url.searchParams.set('limit', '30');
    url.searchParams.set('token', AVIASALES_TOKEN);

    if (returnDate) {
      url.searchParams.set('return_at', returnDate.slice(0, 7));
      url.searchParams.set('one_way', 'false');
    } else {
      url.searchParams.set('one_way', 'true');
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error('[aviasales]', response.status, await response.text().catch(() => ''));
      return { flights: [], pricePoints: [] };
    }

    const data = await response.json();
    if (!data.success || !Array.isArray(data.data)) {
      if (data.error) console.error('[aviasales]', data.error);
      return { flights: [], pricePoints: [] };
    }

    const flights: FlightResult[] = (data.data as AviasalesResult[])
      .filter((item) => {
        if ((item.price ?? 0) <= 0) return false;
        // Only keep flights on or after the requested departure date
        if (item.departure_at) {
          const itemDate = item.departure_at.split('T')[0];
          if (itemDate < departureDate) return false;
        }
        return true;
      })
      .map((item) => {
        const depDate = item.departure_at ? item.departure_at.split('T')[0] : departureDate;
        const retDate = item.return_at ? item.return_at.split('T')[0] : returnDate;
        const airlineCode = item.airline ?? '';
        // Aviasales links are relative paths — prepend base and append affiliate marker
        let bookingUrl: string | undefined;
        if (item.link) {
          const base = `https://www.aviasales.com${item.link}`;
          const sep = base.includes('?') ? '&' : '?';
          bookingUrl = TRAVELPAYOUTS_MARKER ? `${base}${sep}marker=${TRAVELPAYOUTS_MARKER}` : base;
        }

        return {
          price: item.price,
          airline: airlineCode,
          airlineCode,
          stops: item.transfers ?? 0,
          duration: minutesToIsoDuration(item.duration_to),
          departureDate: depDate,
          returnDate: retDate,
          bookingUrl,
          origin: item.origin_airport || item.origin,
          destination: item.destination_airport || item.destination,
        };
      })
      .sort((a, b) => a.price - b.price);

    return { flights, pricePoints: [] };
  } catch (err) {
    console.error('[aviasales]', err);
    return { flights: [], pricePoints: [] };
  }
}

// ---------------------------------------------------------------------------
// Real-time Flight Search API (v1/flight_search)
// Returns live segment data including layover airports and connection times.
// ---------------------------------------------------------------------------

function collectLeafValues(obj: unknown): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return [String(obj)];
  }
  if (Array.isArray(obj)) return obj.flatMap(collectLeafValues);
  if (typeof obj === 'object') return Object.values(obj as Record<string, unknown>).flatMap(collectLeafValues);
  return [];
}

function buildSignature(token: string, marker: string, bodyWithoutSignature: Record<string, unknown>): string {
  const leafValues = collectLeafValues(bodyWithoutSignature);
  const sorted = leafValues.slice().sort();
  const raw = [token, marker, ...sorted].join(':');
  return crypto.createHash('md5').update(raw).digest('hex');
}

interface RealtimeFlight {
  departure: string;
  arrival: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  duration: number; // minutes
  delay: number;    // connection time in minutes after this leg
  operating_carrier: string;
  number: number;
}

interface RealtimeProposal {
  sign: string;
  segment: Array<{ flight: RealtimeFlight[] }>;
  terms: Record<string, { price: number; currency: string }>;
}

interface RealtimeChunk {
  proposals?: RealtimeProposal[];
  search_id?: string;
}

export async function searchFlightsAviasalesRealtime(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  userIp: string = '127.0.0.1'
): Promise<{ flights: FlightResult[]; pricePoints: PricePoint[] }> {
  if (!AVIASALES_TOKEN || !TRAVELPAYOUTS_MARKER) return { flights: [], pricePoints: [] };

  try {
    const segments: Array<{ origin: string; destination: string; date: string }> = [
      { origin, destination, date: departureDate },
    ];
    if (returnDate) segments.push({ origin: destination, destination: origin, date: returnDate });

    const bodyWithoutSignature = {
      marker: TRAVELPAYOUTS_MARKER,
      host: REALTIME_HOST,
      user_ip: userIp,
      locale: 'en',
      trip_class: 'Y',
      passengers: { adults: 1, children: 0, infants: 0 },
      segments,
      currency: 'usd',
    };

    const signature = buildSignature(AVIASALES_TOKEN, TRAVELPAYOUTS_MARKER, bodyWithoutSignature);
    const body = { ...bodyWithoutSignature, signature };

    const initRes = await fetch('https://api.travelpayouts.com/v1/flight_search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Token': AVIASALES_TOKEN },
      body: JSON.stringify(body),
    });

    if (!initRes.ok) {
      console.error('[aviasales-realtime] init failed', initRes.status, await initRes.text().catch(() => ''));
      return { flights: [], pricePoints: [] };
    }

    const initData = await initRes.json();
    const searchId: string = initData.search_id;
    if (!searchId) {
      console.error('[aviasales-realtime] no search_id', initData);
      return { flights: [], pricePoints: [] };
    }

    // Poll until we get the final chunk (only {search_id} with no proposals)
    const allProposals: RealtimeProposal[] = [];
    const resultsUrl = `https://api.travelpayouts.com/v1/flight_search_results?uuid=${searchId}`;
    const maxPolls = 12;

    for (let i = 0; i < maxPolls; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const pollRes = await fetch(resultsUrl, {
        headers: { 'X-Access-Token': AVIASALES_TOKEN },
      });
      if (!pollRes.ok) break;

      const chunks: RealtimeChunk[] = await pollRes.json();
      for (const chunk of chunks) {
        if (chunk.proposals) allProposals.push(...chunk.proposals);
      }

      // Done when the last chunk is only {search_id}
      const last = chunks[chunks.length - 1];
      if (last && !last.proposals && last.search_id) break;
    }

    if (allProposals.length === 0) {
      console.warn('[aviasales-realtime] no proposals returned');
      return { flights: [], pricePoints: [] };
    }

    const mapped: (FlightResult | null)[] = allProposals.map((proposal) => {
      const outboundFlights = proposal.segment[0]?.flight ?? [];
      if (outboundFlights.length === 0) return null;

      const firstLeg = outboundFlights[0];
      const lastLeg = outboundFlights[outboundFlights.length - 1];
      const airlineCode = firstLeg.operating_carrier ?? '';

      // Layovers = arrival airport of each leg except the last.
      // delay is the connection time BEFORE each leg (how long you waited at the transfer airport).
      // So delay on flight[i+1] is the layover duration at flight[i].arrival.
      const layovers = outboundFlights.length > 1
        ? outboundFlights.slice(0, -1).map((f) => f.arrival).filter(Boolean)
        : undefined;
      const layoverDurations = outboundFlights.length > 1
        ? outboundFlights.slice(1).map((f) => f.delay).filter((d) => d > 0)
        : undefined;

      // Total journey = sum of all flight durations + all pre-flight delays (connections).
      // No subtraction needed — each flight's delay is the wait before that leg, all legit.
      const totalMinutes = outboundFlights.reduce((s, f) => s + f.duration + f.delay, 0);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const duration = m > 0 ? `PT${h}H${m}M` : `PT${h}H`;

      const priceEntry = Object.values(proposal.terms ?? {})[0];
      const price = priceEntry?.price ?? 0;
      if (price <= 0) return null;

      let bookingUrl: string | undefined;
      if (proposal.sign) {
        const sep = TRAVELPAYOUTS_MARKER ? '?' : '';
        bookingUrl = `https://www.aviasales.com/search/${origin}${departureDate.replace(/-/g, '').slice(4)}${destination}${returnDate ? returnDate.replace(/-/g, '').slice(4) : '1'}1${sep}marker=${TRAVELPAYOUTS_MARKER}`;
      }

      const result: FlightResult = {
        price,
        airline: airlineCode,
        airlineCode,
        stops: outboundFlights.length - 1,
        layovers: layovers && layovers.length > 0 ? layovers : undefined,
        layoverDurations: layoverDurations && layoverDurations.length > 0 ? layoverDurations : undefined,
        duration,
        departureDate: firstLeg.departure_date ?? departureDate,
        returnDate,
        bookingUrl,
        origin,
        destination,
      };
      return result;
    });

    const flights: FlightResult[] = (mapped.filter((f) => f !== null) as FlightResult[])
      .sort((a, b) => a.price - b.price);

    console.log(`[aviasales-realtime] ${flights.length} flights for ${origin}→${destination}`);
    return { flights, pricePoints: [] };
  } catch (err) {
    console.error('[aviasales-realtime]', err);
    return { flights: [], pricePoints: [] };
  }
}
