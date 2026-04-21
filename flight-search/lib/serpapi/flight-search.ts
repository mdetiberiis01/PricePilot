import { SerpApiFlightsResponse } from '@/types/serpapi';
import { PricePoint } from '@/types/search';

const SERPAPI_KEY = process.env.SERPAPI_KEY || '';

export interface FlightResult {
  price: number;
  airline: string;
  airlineCode: string;
  stops: number;
  layovers?: string[]; // IATA codes of intermediate airports
  layoverDurations?: number[]; // connection time in minutes for each layover
  duration: string; // ISO 8601, e.g. "PT7H30M"
  departureDate: string;
  returnDate?: string;
  bookingUrl?: string;
  bookingToken?: string;
  origin?: string;
  destination?: string;
}

function minutesToIsoDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `PT${h}H${m}M` : `PT${h}H`;
}

export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string
): Promise<{ flights: FlightResult[]; pricePoints: PricePoint[] }> {
  if (!SERPAPI_KEY) return { flights: [], pricePoints: [] };

  try {
    const url = new URL('https://serpapi.com/search');
    url.searchParams.set('engine', 'google_flights');
    url.searchParams.set('departure_id', origin);
    url.searchParams.set('arrival_id', destination);
    url.searchParams.set('outbound_date', departureDate);
    if (returnDate) {
      url.searchParams.set('type', '1'); // round trip
      url.searchParams.set('return_date', returnDate);
    } else {
      url.searchParams.set('type', '2'); // one way
    }
    url.searchParams.set('currency', 'USD');
    url.searchParams.set('hl', 'en');
    url.searchParams.set('api_key', SERPAPI_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error('[serpapi]', response.status, await response.text().catch(() => ''));
      return { flights: [], pricePoints: [] };
    }

    const data: SerpApiFlightsResponse = await response.json();
    if (data.error) {
      console.error('[serpapi]', data.error);
      return { flights: [], pricePoints: [] };
    }

    const itineraries = [...(data.best_flights ?? []), ...(data.other_flights ?? [])];
    const googleFlightsUrl = data.search_metadata?.google_flights_url;

    const flights: FlightResult[] = itineraries
      .filter((it) => (it.price ?? 0) > 0)
      .map((it) => {
        const firstLeg = it.flights?.[0];
        const flightNum = firstLeg?.flight_number ?? '';
        const airlineCode = flightNum.split(' ')[0] ?? '';
        const layoverCodes = it.layovers
          ?.map((l) => l.id)
          .filter((id): id is string => Boolean(id));
        const layoverDurations = it.layovers
          ?.map((l) => l.duration)
          .filter((d): d is number => typeof d === 'number');
        return {
          price: it.price,
          airline: firstLeg?.airline ?? '',
          airlineCode,
          stops: Math.max(0, (it.flights?.length ?? 1) - 1),
          layovers: layoverCodes && layoverCodes.length > 0 ? layoverCodes : undefined,
          layoverDurations: layoverDurations && layoverDurations.length > 0 ? layoverDurations : undefined,
          duration: minutesToIsoDuration(it.total_duration ?? 0),
          departureDate: firstLeg?.departure_airport?.time?.split(' ')[0] ?? departureDate,
          returnDate,
          bookingUrl: googleFlightsUrl,
          bookingToken: it.booking_token,
        };
      })
      .sort((a, b) => a.price - b.price);

    const pricePoints: PricePoint[] = [];
    if (data.price_insights?.price_history) {
      for (const [ts, price] of data.price_insights.price_history) {
        const d = new Date(ts);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        pricePoints.push({ month, price });
      }
    }

    return { flights, pricePoints };
  } catch (err) {
    console.error('[serpapi]', err);
    return { flights: [], pricePoints: [] };
  }
}
