'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth';
import { OriginInput } from '@/components/search/OriginInput';
import { DestinationInput } from '@/components/search/DestinationInput';
import type { User } from '@supabase/supabase-js';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function AddAlertPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [origin, setOrigin] = useState('');
  const [originName, setOriginName] = useState('');
  const [destination, setDestination] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      const u = await getUser();
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
    }
    load();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          origin,
          originName,
          destination,
          maxPrice: Number(maxPrice),
          userId: user.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* Nav */}
      <header className="relative z-10 border-b border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between pr-24">
          <div className="flex items-center gap-10">
            <Link href="/" className="font-bold text-lg tracking-tight text-black dark:text-white">
              ✈ FliteSmart
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm text-black/55 dark:text-white/55">
              <Link href="/" className="hover:text-black dark:hover:text-white transition">Flights</Link>
              <Link href="/alerts" className="hover:text-black dark:hover:text-white transition">Price Alerts</Link>
              <Link href="/how-it-works" className="hover:text-black dark:hover:text-white transition">How it works</Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm">
            {user && (
              <span className="text-black/60 dark:text-white/60 text-sm">
                {(user.user_metadata?.full_name as string) || user.email}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="bg-gradient-to-b from-sky-50 via-sky-50/40 to-white dark:from-slate-900 dark:via-slate-900/40 dark:to-[#0a0a0a] pt-16 pb-24 px-4 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-3 tracking-tight">Add a price alert</h1>
            <p className="text-black/50 dark:text-white/50 text-lg">
              We&apos;ll email you when prices drop below your target.
            </p>
          </div>

          <div className="bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-8">
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">✓</div>
                <h2 className="text-xl font-semibold text-black dark:text-white mb-2">Alert created!</h2>
                <p className="text-black/55 dark:text-white/55 text-sm">
                  We&apos;ll email you when prices drop below your target.
                </p>
                <button
                  onClick={() => router.push('/account')}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-black/80 dark:hover:bg-white/80 transition"
                >
                  Back to my account
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* From / To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <OriginInput
                    value={origin}
                    displayName={originName}
                    onChange={(code, name) => {
                      setOrigin(code);
                      setOriginName(name);
                    }}
                  />
                  <DestinationInput
                    value={destination}
                    onChange={(val) => setDestination(val)}
                  />
                </div>

                {/* Max price */}
                <div>
                  <label className="block text-sm text-black/60 dark:text-white/60 mb-1">Max price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 text-sm select-none">$</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="800"
                      className="w-full bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl pl-8 pr-4 py-3 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:bg-black/80 dark:hover:bg-white/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Saving…' : 'Set alert'}
                </button>

                <p className="text-center text-sm text-black/45 dark:text-white/45">
                  <Link href="/account" className="text-black dark:text-white underline underline-offset-2">
                    Cancel
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/8 dark:border-white/8 py-8 px-6 text-center text-xs text-black/35 dark:text-white/35">
        © {new Date().getFullYear()} FliteSmart · Prices sourced via Kiwi.com · Not affiliated with any airline
      </footer>

    </div>
  );
}
