'use client';

import { SearchResult } from '@/types/search';
import { formatPrice, formatDuration } from '@/lib/utils/format-price';
import { DealBadge } from './DealBadge';
import { HistoricalLow } from './HistoricalLow';
import { PriceSparkline } from './PriceSparkline';
import { AirlineLogo } from './AirlineLogo';
import { BaggageInfo } from './BaggageInfo';
import { RouteBar } from './RouteBar';
import { motion } from 'framer-motion';

interface Props {
  result: SearchResult;
  index: number;
}

function formatLegDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface LegRowProps {
  airlineCode: string;
  date: string;
  from: string;
  to: string;
  stops: number;
  layovers?: string[];
  duration: string;
}

function LegRow({ airlineCode, date, from, to, stops, layovers, duration }: LegRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Airline logo */}
      <AirlineLogo code={airlineCode} size={32} />

      {/* Route bar with date at origin */}
      <RouteBar from={from} to={to} stops={stops} layovers={layovers} fromDate={date} />

      {/* Duration */}
      {duration && (
        <div className="shrink-0 text-right">
          <div className="text-xs text-black/40 dark:text-white/40">{formatDuration(duration)}</div>
        </div>
      )}
    </div>
  );
}

export function FlightCard({ result, index }: Props) {
  function handleClick() {
    let url = result.bookingUrl;
    if (!url) {
      const marker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || '';
      const markerParam = marker ? `?marker=${marker}` : '';
      const dep = result.departureDate.replace(/-/g, '');
      const ret = result.returnDate ? result.returnDate.replace(/-/g, '') : '1';
      url = `https://www.aviasales.com/search/${result.origin}${dep}${result.destination}${ret}1${markerParam}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      onClick={handleClick}
      className="glass-card rounded-2xl border border-black/8 dark:border-white/10 hover:border-black/25 dark:hover:border-white/30 transition-all hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 group cursor-pointer overflow-hidden"
    >
      {/* ── Header: destination + price ── */}
      <div className="flex items-start justify-between px-5 pt-4 pb-3">
        <div>
          <h3 className="text-black dark:text-white font-semibold text-lg leading-tight">
            {result.destinationCity || result.destination}
          </h3>
          <p className="text-black/50 dark:text-white/50 text-sm">{result.destinationCountry}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-black dark:text-white tabular-nums">
            {formatPrice(result.price, result.currency)}
          </div>
          <div className="text-xs text-black/50 dark:text-white/50">per person</div>
        </div>
      </div>

      {/* ── Flight legs ── */}
      <div className="px-5 border-t border-black/6 dark:border-white/8 divide-y divide-black/6 dark:divide-white/8">
        {/* Outbound */}
        <LegRow
          airlineCode={result.airlineCode}
          date={formatLegDate(result.departureDate)}
          from={result.origin}
          to={result.destination}
          stops={result.stops}
          layovers={result.layovers}
          duration={result.duration}
        />

        {/* Return (only when round-trip) */}
        {result.returnDate && (
          <LegRow
            airlineCode={result.airlineCode}
            date={formatLegDate(result.returnDate)}
            from={result.destination}
            to={result.origin}
            stops={result.stops}
            layovers={result.layovers}
            duration={result.duration}
          />
        )}
      </div>

      {/* ── Baggage + deal badge + historical low ── */}
      <div className="px-5 py-2.5 border-t border-black/6 dark:border-white/8 flex items-center justify-between gap-2 flex-wrap">
        <BaggageInfo carryOn={1} checked={0} />
        <div className="flex items-center gap-2">
          <DealBadge rating={result.dealRating} percent={result.dealPercent} />
          <HistoricalLow historicalLow={result.historicalLow} currency={result.currency} />
        </div>
      </div>

      {/* ── Sparkline ── */}
      <div className="px-5 pb-1">
        <PriceSparkline data={result.priceHistory} currentPrice={result.price} />
      </div>

      {/* ── CTA footer ── */}
      <div className="px-5 py-3 border-t border-black/8 dark:border-white/10 flex items-center justify-between">
        <span className="text-xs text-black/30 dark:text-white/30">
          aviasales.com
        </span>
        <span className="text-xs text-black/60 dark:text-white/60 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">
          Book now →
        </span>
      </div>
    </motion.div>
  );
}
