'use client';

import { SearchResult } from '@/types/search';

type SortKey = 'price' | 'date' | 'deal';
export type ViewMode = 'tiles' | 'list';

interface Props {
  results: SearchResult[];
  sortBy: SortKey;
  onSortChange: (key: SortKey) => void;
  filterStops: number | null;
  onFilterStopsChange: (stops: number | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function SortFilterBar({
  sortBy,
  onSortChange,
  filterStops,
  onFilterStopsChange,
  viewMode,
  onViewModeChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Sort */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-black/40 dark:text-white/40">Sort:</span>
        {(['price', 'date', 'deal'] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => onSortChange(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sortBy === key
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-black/5 text-black/60 hover:bg-black/10 hover:text-black dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
          >
            {key === 'price' ? 'Cheapest' : key === 'date' ? 'Soonest' : 'Best deal'}
          </button>
        ))}
      </div>

      {/* Stops filter */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-black/40 dark:text-white/40">Stops:</span>
        {([null, 0, 1] as (number | null)[]).map((stops) => (
          <button
            key={String(stops)}
            onClick={() => onFilterStopsChange(stops)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterStops === stops
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-black/5 text-black/60 hover:bg-black/10 hover:text-black dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
          >
            {stops === null ? 'Any' : stops === 0 ? 'Nonstop' : '1 stop'}
          </button>
        ))}
      </div>

      {/* View mode toggle */}
      <div className="ml-auto flex items-center gap-1.5 text-sm">
        <span className="text-black/40 dark:text-white/40">View:</span>
        <button
          onClick={() => onViewModeChange('tiles')}
          aria-label="Tile view"
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === 'tiles'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'text-black/40 hover:text-black hover:bg-black/8 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10'
          }`}
        >
          {/* Grid icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          aria-label="List view"
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === 'list'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'text-black/40 hover:text-black hover:bg-black/8 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10'
          }`}
        >
          {/* List icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="2.5" rx="1" />
            <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
            <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
