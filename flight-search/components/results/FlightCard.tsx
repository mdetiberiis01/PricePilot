'use client';

import { SearchResult } from '@/types/search';
import { formatPrice, formatDuration } from '@/lib/utils/format-price';
import { DealBadge } from './DealBadge';
import { HistoricalLow } from './HistoricalLow';
import { PriceSparkline } from './PriceSparkline';
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
    year: 'numeric',
  });
}

export function FlightCard({ result, index }: Props) {
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      onClick={handleClick}
      className="glass-card rounded-2xl p-5 border border-black/8 dark:border-white/10 hover:border-black/25 dark:hover:border-white/30 transition-all hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <AirlineLogo code={result.airlineCode} size={40} />
          <div>
            <h3 className="text-black dark:text-white font-semibold text-lg leading-tight transition-colors">
              {result.destinationCity || result.destination}
            </h3>
            <p className="text-black/50 dark:text-white/50 text-sm">{result.destinationCountry}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-black dark:text-white">
            {formatPrice(result.price, result.currency)}
          </div>
          <div className="text-xs text-black/50 dark:text-white/50">per person</div>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 mb-3 text-sm text-black/60 dark:text-white/60">
        <span>{result.origin}</span>
        <span className="flex-1 flex items-center gap-1">
          <span className="h-px flex-1 bg-black/20 dark:bg-white/20" />
          <span className="text-black/30 dark:text-white/30">✈</span>
          <span className="h-px flex-1 bg-black/20 dark:bg-white/20" />
        </span>
        <span>{result.destination}</span>
      </div>

      {/* Dates */}
      {result.departureDate && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 glass-card border border-black/8 dark:border-white/10 rounded-lg px-3 py-2 text-center">
            <div className="text-xs text-black/40 dark:text-white/40 mb-0.5">Depart</div>
            <div className="text-black dark:text-white text-sm font-medium">{formatDate(result.departureDate)}</div>
          </div>
          {result.returnDate && (
            <>
              <span className="text-black/20 dark:text-white/20 text-xs">→</span>
              <div className="flex-1 glass-card border border-black/8 dark:border-white/10 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-black/40 dark:text-white/40 mb-0.5">Return</div>
                <div className="text-black dark:text-white text-sm font-medium">{formatDate(result.returnDate)}</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Flight meta */}
      <div className="flex flex-wrap gap-2 text-xs text-black/50 dark:text-white/50 mb-3">
        {result.airline && result.airline !== 'Various' && <span>{result.airline}</span>}
        <span>· {stops}</span>
        {result.duration && <span>· {formatDuration(result.duration)}</span>}
      </div>

      {/* Deal badge & historical low */}
      <div className="flex items-center justify-between mb-3">
        <DealBadge rating={result.dealRating} percent={result.dealPercent} />
        <HistoricalLow historicalLow={result.historicalLow} currency={result.currency} />
      </div>

      {/* Sparkline */}
      <PriceSparkline data={result.priceHistory} currentPrice={result.price} />

      {/* CTA */}
      <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
        <span className="text-xs text-black/30 dark:text-white/30">
          {result.bookingUrl ? 'kiwi.com' : 'kayak.com'}
        </span>
        <span className="text-xs text-black/60 dark:text-white/60 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">
          Book now →
        </span>
      </div>
    </motion.div>
  );
}
