'use client';

import { SearchResult } from '@/types/search';
import { formatPrice, formatDuration } from '@/lib/utils/format-price';
import { DealBadge } from './DealBadge';
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

export function FlightRow({ result, index }: Props) {
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={handleClick}
      className="glass-card rounded-xl border border-black/8 dark:border-white/10 hover:border-black/25 dark:hover:border-white/30 transition-all hover:shadow-md hover:shadow-black/5 dark:hover:shadow-white/5 group cursor-pointer"
    >
      <div className="flex items-stretch gap-0">

        {/* ── Left: destination name ── */}
        <div className="px-4 py-3 flex flex-col justify-center w-36 shrink-0 border-r border-black/6 dark:border-white/8">
          <div className="font-semibold text-black dark:text-white text-sm leading-tight truncate">
            {result.destinationCity || result.destination}
          </div>
          <div className="text-xs text-black/45 dark:text-white/45 truncate mt-0.5">
            {result.destinationCountry}
          </div>
        </div>

        {/* ── Middle: flight legs ── */}
        <div className="flex-1 min-w-0 divide-y divide-black/6 dark:divide-white/8">

          {/* Outbound leg */}
          <div className="flex items-center gap-3 px-4 py-2.5">
            <AirlineLogo code={result.airlineCode} size={28} />
            <RouteBar
              from={result.origin}
              to={result.destination}
              stops={result.stops}
              layovers={result.layovers}
              fromDate={formatLegDate(result.departureDate)}
            />
            {result.duration && (
              <span className="text-xs text-black/40 dark:text-white/40 shrink-0 hidden md:block tabular-nums">
                {formatDuration(result.duration)}
              </span>
            )}
          </div>

          {/* Return leg (round-trip only) */}
          {result.returnDate && (
            <div className="flex items-center gap-3 px-4 py-2.5">
              <AirlineLogo code={result.airlineCode} size={28} />
              <RouteBar
                from={result.destination}
                to={result.origin}
                stops={result.stops}
                layovers={result.layovers}
                fromDate={formatLegDate(result.returnDate)}
              />
              {result.duration && (
                <span className="text-xs text-black/40 dark:text-white/40 shrink-0 hidden md:block tabular-nums">
                  {formatDuration(result.duration)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Right: baggage + price + CTA ── */}
        <div className="flex flex-col items-end justify-center gap-2 px-4 py-3 border-l border-black/6 dark:border-white/8 shrink-0">
          <BaggageInfo carryOn={1} checked={0} />
          <div className="text-xl font-bold text-black dark:text-white tabular-nums">
            {formatPrice(result.price, result.currency)}
          </div>
          <div className="flex items-center gap-2">
            <DealBadge rating={result.dealRating} percent={result.dealPercent} />
            <span className="text-xs font-medium text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white transition-colors">
              Book →
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
