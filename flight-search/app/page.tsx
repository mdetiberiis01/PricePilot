'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/ui/Nav';
import { SearchForm } from '@/components/search/SearchForm';
import { TrendingDestinations, TrendingDest } from '@/components/landing/TrendingDestinations';
import { useSearchForm } from '@/hooks/useSearchForm';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const hook = useSearchForm();
  const { user } = useAuth();
  const homeAirport = user?.user_metadata?.home_airport as string | undefined;
  const router = useRouter();
  const [needsOrigin, setNeedsOrigin] = useState(false);

  function handleTrendingSelect(dest: TrendingDest) {
    hook.updateField('destination', dest.destination);
    if (hook.form.origin) {
      setNeedsOrigin(false);
      const params = new URLSearchParams({
        origin: hook.form.origin,
        originName: hook.form.originName || hook.form.origin,
        destination: dest.destination,
        flexibility: hook.form.flexibility,
        tripDays: String(hook.form.tripDays ?? 7),
      });
      router.push(`/results?${params.toString()}`);
    } else {
      // Show prompt and scroll to origin input
      setNeedsOrigin(true);
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="City, airport"]');
        input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input?.focus();
      }, 50);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a]">
      <Nav activePage="flights" />

      {/* Trust bar */}
      <div className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/8 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-white/40">
          <span><strong className="text-slate-700 dark:text-white/70">2M+</strong> flights searched</span>
          <span className="text-slate-300 dark:text-white/20 hidden sm:inline">·</span>
          <span className="hidden sm:inline"><strong className="text-slate-700 dark:text-white/70">Live prices</strong> from 750+ airlines</span>
          <span className="text-slate-300 dark:text-white/20 hidden md:inline">·</span>
          <span className="hidden md:inline"><strong className="text-slate-700 dark:text-white/70">No booking fees</strong> — compare and book direct</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/40 dark:to-[#0a0a0a] border-b border-slate-100 dark:border-white/8 pt-10 pb-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
              Find your next flight.
            </h1>
            <p className="text-slate-500 dark:text-white/50 text-lg">
              Flexible dates · Real price history · No booking fees
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
            <div>
              {needsOrigin && (
                <div className="mb-3 px-4 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-sm font-medium">
                  ✈ Destination set! Now enter your departure city to search.
                </div>
              )}
              <SearchForm hook={hook} />
            </div>
            <TrendingDestinations onSelect={handleTrendingSelect} homeAirport={homeAirport} />
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-[#0a0a0a] py-20 px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-10 text-center">
            Why FliteSmart
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📈',
                title: 'Real Price History',
                desc: '12-month sparkline charts on every result so you can see if a price is genuinely cheap or just looks cheap.',
              },
              {
                icon: '📅',
                title: 'Flexible Date Search',
                desc: 'No fixed dates needed. Search by Spring, Summer, Fall, Winter, or Anytime — we find the cheapest windows.',
              },
              {
                icon: '🌏',
                title: 'Region & Anywhere Search',
                desc: 'Type "Southeast Asia" or "Anywhere" and we surface the best-priced destinations across the whole region.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex gap-5 p-6 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:border-slate-200 dark:hover:border-white/20 transition"
              >
                <span className="text-3xl mt-0.5 shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-slate-500 dark:text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-white/8 py-8 px-6 text-center text-xs text-slate-400 dark:text-white/35">
        © {new Date().getFullYear()} FliteSmart · Prices sourced from live airline data · Not affiliated with any airline
      </footer>
    </div>
  );
}
