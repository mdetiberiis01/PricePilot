'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchResult } from '@/types/search';
import { ResultsGrid } from '@/components/results/ResultsGrid';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const DestinationMap = dynamic(
  () => import('@/components/map/DestinationMap').then((m) => m.DestinationMap),
  { ssr: false }
);

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [dismissedDemoBanner, setDismissedDemoBanner] = useState(false);

  const origin = searchParams.get('origin') || '';
  const originName = searchParams.get('originName') || origin;
  const destination = searchParams.get('destination') || '';
  const flexibility = searchParams.get('flexibility') || 'anytime';
  const tripDays = parseInt(searchParams.get('tripDays') || '7', 10);

  useEffect(() => {
    if (!origin || !destination) {
      router.push('/');
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        originName,
        destination,
        flexibility,
        tripDays,
        customDateStart: searchParams.get('customDateStart') || undefined,
        customDateEnd: searchParams.get('customDateEnd') || undefined,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setResults(data.results || []);
        }
      })
      .catch(() => setError('Search failed. Please check your connection.'))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, flexibility]);

  const flexLabel =
    {
      anytime: 'Anytime',
      spring: 'Spring',
      summer: 'Summer',
      fall: 'Fall',
      winter: 'Winter',
      custom: 'Custom dates',
    }[flexibility] || flexibility;

  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-black/10 dark:border-white/10 glass-card sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition text-sm flex items-center gap-2"
          >
            ← Back
          </button>
          <div className="text-center">
            <div>
              <span className="text-black dark:text-white font-semibold">
                {originName} → {destination}
              </span>
              <span className="text-black/50 dark:text-white/50 text-sm ml-2">{flexLabel}</span>
            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition text-xs mt-1"
            >
              {showMap ? 'Hide map' : 'Show map'}
            </button>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Map (optional) */}
        {showMap && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <DestinationMap results={results} origin={origin} />
          </motion.div>
        )}

        {/* Demo data banner */}
        {!isLoading && !error && !dismissedDemoBanner && results.length > 0 && results.every((r) => r.dataSource === 'demo') && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300">
            <span>Showing sample prices — configure API keys to see live fares.</span>
            <button
              onClick={() => setDismissedDemoBanner(true)}
              className="shrink-0 text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-100 transition"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Results header */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <h2 className="text-black dark:text-white text-2xl font-bold">
              {results.length > 0
                ? `${results.length} flight${results.length !== 1 ? 's' : ''} found`
                : 'Searching...'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-black/50 dark:text-white/50 text-sm">From {originName}</span>
              <span className="text-black/20 dark:text-white/20">·</span>
              <span className="text-black/50 dark:text-white/50 text-sm">{flexLabel}</span>
              <span className="text-black/20 dark:text-white/20">·</span>
              <span className="glass-card border border-black/20 dark:border-white/20 text-black/70 dark:text-white/70 text-xs font-medium px-2.5 py-1 rounded-full">
                {tripDays} day{tripDays !== 1 ? 's' : ''}
              </span>
              <span className="text-black/20 dark:text-white/20">·</span>
              <span className="text-black/50 dark:text-white/50 text-sm">Prices per person roundtrip</span>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="glass-card border border-red-500/30 rounded-xl p-6 mb-6 text-center">
            <p className="text-red-400">{error}</p>
            <p className="text-white/50 text-sm mt-2">
              Make sure your API keys are configured in .env.local
            </p>
          </div>
        )}


        <ResultsGrid results={results} isLoading={isLoading} />
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-black/60 dark:text-white/60 text-lg">Loading...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
