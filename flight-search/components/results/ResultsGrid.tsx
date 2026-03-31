'use client';

import { useState, useMemo } from 'react';
import { SearchResult } from '@/types/search';
import { FlightCard } from './FlightCard';
import { FlightRow } from './FlightRow';
import { SortFilterBar, ViewMode } from './SortFilterBar';
import { Skeleton } from '@/components/ui/skeleton';

type SortKey = 'price' | 'date' | 'deal';

interface Props {
  results: SearchResult[];
  isLoading: boolean;
}

export function ResultsGrid({ results, isLoading }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>('price');
  const [filterStops, setFilterStops] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const displayResults = useMemo(() => {
    let filtered = results;
    if (filterStops !== null) {
      filtered = filtered.filter((r) => r.stops === filterStops);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'date') return a.departureDate.localeCompare(b.departureDate);
      if (sortBy === 'deal') {
        const ratingOrder = { great: 0, good: 1, fair: 2, 'above-average': 3, unknown: 4 };
        return ratingOrder[a.dealRating] - ratingOrder[b.dealRating];
      }
      return 0;
    });
  }, [results, sortBy, filterStops]);

  if (isLoading) {
    return (
      <div>
        <div className="h-10 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
              <Skeleton className="h-6 w-3/4 bg-black/8 dark:bg-white/10" />
              <Skeleton className="h-4 w-1/2 bg-black/8 dark:bg-white/10" />
              <Skeleton className="h-8 w-full bg-black/8 dark:bg-white/10" />
              <Skeleton className="h-12 w-full bg-black/8 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center py-16">
        <h3 className="text-black dark:text-white text-xl font-semibold mb-2">No flights found</h3>
        <p className="text-black/50 dark:text-white/50">Try a different destination or time period</p>
      </div>
    );
  }

  return (
    <div>
      <SortFilterBar
        results={results}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterStops={filterStops}
        onFilterStopsChange={setFilterStops}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'tiles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayResults.map((result, i) => (
            <FlightCard key={result.id} result={result} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayResults.map((result, i) => (
            <FlightRow key={result.id} result={result} index={i} />
          ))}
        </div>
      )}

      {filterStops !== null && displayResults.length === 0 && (
        <div className="text-center py-8 text-black/50 dark:text-white/50">
          No flights match this filter.{' '}
          <button onClick={() => setFilterStops(null)} className="text-black dark:text-white underline">
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}
