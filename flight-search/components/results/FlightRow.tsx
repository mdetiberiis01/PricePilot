'use client';

import { SearchResult } from '@/types/search';
import { formatPrice, formatDuration } from '@/lib/utils/format-price';
import { DealBadge } from './DealBadge';
import { AirlineLogo } from './AirlineLogo';
import { motion } from 'framer-motion';

interface Props {
  result: SearchResult;
  index: number;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function FlightRow({ result, index }: Props) {
  const stops =
    result.stops === 0 ? 'Nonstop' : result.stops === 1 ? '1 stop' : `${result.stops} stops`;

  function handleClick() {
    let url = result.bookingUrl;
    if (!url) {
      const route = `${result.origin}-${result.destination}`;
      const dep = result.departureDate;
      const ret = result.returnDate ? `/${result.returnDate}` : '';
      url = `https://www.kayak.com/flights/${route}/${dep}${ret}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={handleClick}
      className="glass-card rounded-xl px-4 py-3.5 border border-black/8 dark:border-white/10 hover:border-black/25 dark:hover:border-white/30 transition-all hover:shadow-md hover:shadow-black/5 dark:hover:shadow-white/5 group cursor-pointer flex items-center gap-4"
    >
      {/* Airline logo */}
      <AirlineLogo code={result.airlineCode} size={44} />

      {/* Destination */}
      <div className="w-32 shrink-0">
        <div className="font-semibold text-black dark:text-white text-sm truncate leading-tight">
          {result.destinationCity || result.destination}
        </div>
        <div className="text-xs text-black/45 dark:text-white/45 truncate mt-0.5">
          {result.destinationCountry}
        </div>
      </div>

      {/* Route line + flight meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm text-black/70 dark:text-white/70">
          <span className="font-medium tabular-nums">{result.origin}</span>
          <span className="flex-1 flex items-center gap-0.5 min-w-0">
            <span className="h-px flex-1 bg-black/15 dark:bg-white/15" />
            <span className="text-black/30 dark:text-white/30 text-[10px] px-0.5">✈</span>
            <span className="h-px flex-1 bg-black/15 dark:bg-white/15" />
          </span>
          <span className="font-medium tabular-nums">{result.destination}</span>
        </div>
        <div className="flex flex-wrap gap-x-2 text-xs text-black/40 dark:text-white/40 mt-0.5">
          <span>{stops}</span>
          {result.duration && <span>· {formatDuration(result.duration)}</span>}
          {result.airline && result.airline !== 'Various' && (
            <span className="hidden sm:inline">· {result.airline}</span>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="hidden sm:flex flex-col items-end shrink-0 text-sm">
        <span className="text-black/70 dark:text-white/70 tabular-nums">{formatDate(result.departureDate)}</span>
        {result.returnDate && (
          <span className="text-xs text-black/40 dark:text-white/40 mt-0.5 tabular-nums">
            ↩ {formatDate(result.returnDate)}
          </span>
        )}
      </div>

      {/* Deal badge */}
      <div className="hidden lg:block shrink-0">
        <DealBadge rating={result.dealRating} percent={result.dealPercent} />
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <div className="text-xl font-bold text-black dark:text-white tabular-nums">
          {formatPrice(result.price, result.currency)}
        </div>
        <div className="text-xs text-black/40 dark:text-white/40">per person</div>
      </div>

      {/* Book CTA */}
      <div className="shrink-0 text-xs font-medium text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white transition-colors hidden sm:block">
        Book →
      </div>
    </motion.div>
  );
}
