'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OriginInput } from '@/components/search/OriginInput';
import { DestinationInput } from '@/components/search/DestinationInput';
type Status = 'idle' | 'submitting' | 'success' | 'error';

const inputClass =
  'w-full bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl px-4 py-3 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40 focus:border-transparent transition';

export default function AlertsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [origin, setOrigin] = useState('');
  const [originName, setOriginName] = useState('');
  const [destination, setDestination] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      // 1. Create Supabase account + send confirmation email
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!signupRes.ok) {
        const data = await signupRes.json().catch(() => ({}));
        throw new Error(data.error || 'Could not create account');
      }
      const { userId } = await signupRes.json();

      // 2. Save the price alert
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          origin,
          originName,
          destination,
          maxPrice: Number(maxPrice),
          userId,
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
              <Link href="/alerts" className="text-black dark:text-white">Price Alerts</Link>
              <Link href="/how-it-works" className="hover:text-black dark:hover:text-white transition">How it works</Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm">
            <Link href="/login" className="text-black/55 dark:text-white/55 hover:text-black dark:hover:text-white transition">Sign in</Link>
            <Link href="/alerts" className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 transition">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 via-sky-50/40 to-white dark:from-slate-900 dark:via-slate-900/40 dark:to-[#0a0a0a] pt-16 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-3 tracking-tight">
              Price Alerts
            </h1>
            <p className="text-black/50 dark:text-white/50 text-lg max-w-lg mx-auto">
              Create a free account and we&apos;ll email you when prices drop below your target.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-8">
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">✓</div>
                <h2 className="text-xl font-semibold text-black dark:text-white mb-2">Account created!</h2>
                <p className="text-black/55 dark:text-white/55 text-sm mb-1">
                  We sent a confirmation to <span className="font-medium text-black dark:text-white">{email}</span>.
                </p>
                <p className="text-black/55 dark:text-white/55 text-sm">
                  You&apos;ll hear from us when prices drop. You can sign in anytime to manage your alerts.
                </p>
                <button
                  onClick={() => router.push('/account')}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-black/80 dark:hover:bg-white/80 transition"
                >
                  Go to my account
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-black/60 dark:text-white/60 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Smith"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-black/60 dark:text-white/60 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-black/60 dark:text-white/60 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={inputClass}
                  />
                </div>

                <div className="border-t border-black/8 dark:border-white/8 pt-5">
                  <p className="text-xs text-black/40 dark:text-white/40 mb-4 uppercase tracking-wide font-medium">Alert settings</p>

                  {/* From / To */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <OriginInput
                      value={origin}
                      displayName={originName}
                      onChange={(code, name) => {
                        setOrigin(code);
                        setOriginName(name);
                      }}
                    />
                    <div>
                      <label className="block text-sm text-black/60 dark:text-white/60 mb-1">To</label>
                      <DestinationInput
                        value={destination}
                        onChange={(val) => setDestination(val)}
                      />
                    </div>
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
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:bg-black/80 dark:hover:bg-white/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Creating account…' : 'Create account & set alert'}
                </button>

                <p className="text-center text-sm text-black/45 dark:text-white/45">
                  Already have an account?{' '}
                  <Link href="/login" className="text-black dark:text-white underline underline-offset-2">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>

          {/* Feature bullets */}
          <ul className="mt-8 space-y-2 text-sm text-black/50 dark:text-white/50 text-center">
            <li className="flex items-center justify-center gap-2">
              <span className="text-base">📉</span> Alerts when price drops below your max
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-base">⚡</span> Flash deals 30%+ below the 12-month average
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-base">📬</span> Weekly digest of best prices <span className="text-black/30 dark:text-white/30">(coming soon)</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/8 dark:border-white/8 py-8 px-6 text-center text-xs text-black/35 dark:text-white/35 mt-auto">
        © {new Date().getFullYear()} FliteSmart · Prices sourced via Kiwi.com · Not affiliated with any airline
      </footer>

    </div>
  );
}
