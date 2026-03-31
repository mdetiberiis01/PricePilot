/**
 * Aviasales / Travelpayouts Prices API
 *
 * Free token — sign up at https://www.travelpayouts.com/developers/api
 * (Account → API → copy your token)
 *
 * Returns cached cheapest prices from 750+ airlines, refreshed every ~20 min.
 * Perfect for price-discovery / "find cheap dates" use cases.
 */

import { FlightResult } from '../serpapi/flight-search';
import { PricePoint } from '@/types/search';

const AVIASALES_TOKEN = process.env.AVIASALES_TOKEN || '';
const TRAVELPAYOUTS_MARKER = process.env.TRAVELPAYOUTS_MARKER || '';

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
    url.searchParams.set('departure_at', departureDate);      // YYYY-MM-DD or YYYY-MM
    url.searchParams.set('sorting', 'price');
    url.searchParams.set('currency', 'usd');
    url.searchParams.set('limit', '5');
    url.searchParams.set('token', AVIASALES_TOKEN);

    if (returnDate) {
      url.searchParams.set('return_at', returnDate);
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
      .filter((item) => (item.price ?? 0) > 0)
      .map((item) => {
        const depDate = item.departure_at ? item.departure_at.split('T')[0] : departureDate;
        const retDate = item.return_at ? item.return_at.split('T')[0] : returnDate;
        const airlineCode = item.airline ?? '';
        // Aviasales links are relative paths — prepend base and append affiliate marker
        const bookingUrl = item.link
          ? `https://www.aviasales.com${item.link}${TRAVELPAYOUTS_MARKER ? `&marker=${TRAVELPAYOUTS_MARKER}` : ''}`
          : undefined;

        return {
          price: item.price,
          airline: airlineCode,
          airlineCode,
          stops: item.transfers ?? 0,
          duration: minutesToIsoDuration(item.duration_to),
          departureDate: depDate,
          returnDate: retDate,
          bookingUrl,
        };
      })
      .sort((a, b) => a.price - b.price);

    return { flights, pricePoints: [] };
  } catch (err) {
    console.error('[aviasales]', err);
    return { flights: [], pricePoints: [] };
  }
}
