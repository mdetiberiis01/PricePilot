'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputClass =
    'w-full bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl px-4 py-3 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40 focus:border-transparent transition';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
      setLoading(false);
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
            <Link href="/login" className="text-black dark:text-white">Sign in</Link>
            <Link href="/alerts" className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 transition">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="bg-gradient-to-b from-sky-50 via-sky-50/40 to-white dark:from-slate-900 dark:via-slate-900/40 dark:to-[#0a0a0a] pt-16 pb-24 px-4 flex-1">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2 tracking-tight">Sign in</h1>
            <p className="text-black/50 dark:text-white/50 text-sm">Welcome back — manage your price alerts.</p>
          </div>

          <div className="bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-sm text-black/60 dark:text-white/60 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:bg-black/80 dark:hover:bg-white/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-black/45 dark:text-white/45">
              Don&apos;t have an account?{' '}
              <Link href="/alerts" className="text-black dark:text-white underline underline-offset-2">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/8 dark:border-white/8 py-8 px-6 text-center text-xs text-black/35 dark:text-white/35">
        © {new Date().getFullYear()} FliteSmart · Prices sourced via Kiwi.com · Not affiliated with any airline
      </footer>

    </div>
  );
}
