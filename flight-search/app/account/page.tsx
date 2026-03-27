'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, signOut } from '@/lib/supabase/auth';
import { getUserAlerts, deactivateAlert, UserAlert } from '@/lib/supabase/user-alerts';
import type { User } from '@supabase/supabase-js';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const u = await getUser();
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      try {
        const a = await getUserAlerts();
        setAlerts(a);
      } catch {
        // alerts load failure is non-fatal
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleDeactivate(id: string) {
    await deactivateAlert(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: false } : a)),
    );
  }

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  const name = user?.user_metadata?.full_name as string | undefined;

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
                {name || user.email}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="bg-gradient-to-b from-sky-50 via-sky-50/40 to-white dark:from-slate-900 dark:via-slate-900/40 dark:to-[#0a0a0a] pt-16 pb-24 px-4 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-1 tracking-tight">
              {name ? `Hey, ${name.split(' ')[0]}` : 'My Account'}
            </h1>
            <p className="text-black/50 dark:text-white/50 text-sm">{user?.email}</p>
          </div>

          {loading ? (
            <div className="text-black/40 dark:text-white/40 text-sm">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-black dark:text-white">Your price alerts</h2>
                <Link
                  href="/account/add-alert"
                  className="text-sm px-4 py-1.5 rounded-full border border-black/20 dark:border-white/20 text-black/70 dark:text-white/70 hover:border-black/40 dark:hover:border-white/40 hover:text-black dark:hover:text-white transition"
                >
                  + Add alert
                </Link>
              </div>

              {alerts.length === 0 ? (
                <div className="bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-black/40 dark:text-white/40 text-sm mb-4">No alerts yet.</p>
                  <Link
                    href="/account/add-alert"
                    className="inline-block px-6 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-black/80 dark:hover:bg-white/80 transition"
                  >
                    Set your first alert
                  </Link>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`bg-white dark:bg-white/[0.04] border rounded-2xl p-5 flex items-center justify-between gap-4 transition ${
                      alert.is_active
                        ? 'border-black/10 dark:border-white/10'
                        : 'border-black/5 dark:border-white/5 opacity-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-black dark:text-white text-sm">
                        {alert.origin_name || alert.origin} → {alert.destination}
                      </div>
                      <div className="text-black/45 dark:text-white/45 text-xs mt-0.5">
                        Max ${alert.max_price} · Added {new Date(alert.created_at).toLocaleDateString()}
                        {alert.last_alerted_at && (
                          <> · Last alerted {new Date(alert.last_alerted_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {alert.is_active ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/8 dark:bg-white/10 text-black/40 dark:text-white/40">
                          Paused
                        </span>
                      )}
                      {alert.is_active && (
                        <button
                          onClick={() => handleDeactivate(alert.id)}
                          className="text-xs text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60 transition"
                        >
                          Pause
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-black/8 dark:border-white/8 py-8 px-6 text-center text-xs text-black/35 dark:text-white/35">
        © {new Date().getFullYear()} FliteSmart · Prices sourced via Kiwi.com · Not affiliated with any airline
      </footer>

    </div>
  );
}
