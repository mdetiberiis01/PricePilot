export interface SearchParams {
  origin: string;
  originName?: string;
  destination: string;
  flexibility: 'anytime' | 'spring' | 'summer' | 'fall' | 'winter' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  tripDays?: number;
  tripType?: 'roundtrip' | 'oneway';
  travelers?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  maxBudget?: number;
}

export interface PricePoint {
  month: string; // YYYY-MM
  price: number;
}

export interface SearchResult {
  id: string;
  origin: string;
  destination: string;
  destinationName: string;
  destinationCity: string;
  destinationCountry: string;
  departureDate: string;
  returnDate?: string;
  price: number;
  currency: string;
  airline: string;
  airlineCode: string;
  stops: number;
  layovers?: string[]; // IATA codes of intermediate airports, e.g. ["CDG", "AMS"]
  layoverDurations?: number[]; // connection time in minutes for each layover
  duration: string;
  bookingUrl?: string;
  bookingToken?: string;
  historicalLow: number | null;
  avg12m: number | null;
  dealRating: 'great' | 'good' | 'fair' | 'above-average' | 'unknown';
  dealPercent: number | null;
  priceHistory: PricePoint[];
  dataSource: string;
}

export interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  airline: string;
  airlineCode: string;
  stops: number;
  duration: string;
  departureDate: string;
  returnDate?: string;
  origin: string;
  destination: string;
  bookingUrl?: string;
}
