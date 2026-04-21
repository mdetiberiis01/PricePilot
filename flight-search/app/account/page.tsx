'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, updateHomeAirport } from '@/lib/supabase/auth';
import { getUserAlerts, deactivateAlert, deleteAlert, reactivateAlert, UserAlert } from '@/lib/supabase/user-alerts';
import { Nav } from '@/components/ui/Nav';
import { OriginInput } from '@/components/search/OriginInput';
import type { User } from '@supabase/supabase-js';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Home airport state
  const [homeAirport, setHomeAirport] = useState('');
  const [homeAirportName, setHomeAirportName] = useState('');
  const [savingAirport, setSavingAirport] = useState(false);
  const [airportSaved, setAirportSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const u = await getUser();
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      // Populate home airport from saved metadata
      const savedCode = u.user_metadata?.home_airport as string | undefined;
      const savedName = u.user_metadata?.home_airport_name as string | undefined;
      if (savedCode) {
        setHomeAirport(savedCode);
        setHomeAirportName(savedName ?? savedCode);
      }
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

  async function handleSaveAirport() {
    if (!homeAirport) return;
    setSavingAirport(true);
    try {
      await updateHomeAirport(homeAirport, homeAirportName || homeAirport);
      setAirportSaved(true);
      setTimeout(() => setAirportSaved(false), 2500);
    } catch {
      // ignore
    } finally {
      setSavingAirport(false);
    }
  }

  async function handleDeactivate(id: string) {
    await deactivateAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: false } : a)));
  }

  async function handleDelete(id: string) {
    await deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleReactivate(id: string) {
    await reactivateAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: true } : a)));
  }

  const name = user?.user_metadata?.full_name as string | undefined;
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <section className="bg-gradient-to-b from-sky-50 via-sky-50/40 to-white dark:from-slate-900 dark:via-slate-900/40 dark:to-[#0a0a0a] pt-16 pb-24 px-4 flex-1">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* ── Account Info ── */}
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-1 tracking-tight">
              {name ? `Hey, ${name.split(' ')[0]}` : 'My Account'}
            </h1>
            <p className="text-black/50 dark:text-white/50 text-sm">{user?.email}</p>
          </div>

          <div className="bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-black dark:text-white">Account info</h2>

            {/* Name + email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-black/40 dark:text-white/40 mb-1">Name</p>
                <p className="text-black dark:text-white font-medium">{name || '—'}</p>
              </div>
              <div>
                <p className="text-black/40 dark:text-white/40 mb-1">Email</p>
                <p className="text-black dark:text-white font-medium">{user?.email}</p>
              </div>
              {memberSince && (
                <div>
                  <p className="text-black/40 dark:text-white/40 mb-1">Member since</p>
                  <p className="text-black dark:text-white font-medium">{memberSince}</p>
                </div>
              )}
              <div>
                <p className="text-black/40 dark:text-white/40 mb-1">User ID</p>
                <p className="text-black/50 dark:text-white/50 font-mono text-xs truncate">{user?.id}</p>
              </div>
            </div>

            {/* Home airport */}
            <div className="border-t border-black/8 dark:border-white/8 pt-5">
              <p className="text-sm font-medium text-black dark:text-white mb-1">Home airport</p>
              <p className="text-xs text-black/45 dark:text-white/45 mb-3">
                Used as the default departure airport across FliteSmart.
              </p>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <OriginInput
                    value={homeAirport}
                    displayName={homeAirportName}
                    onChange={(code, name) => {
                      setHomeAirport(code);
                      setHomeAirportName(name);
                      setAirportSaved(false);
                    }}
                  />
                </div>
                <button
                  onClick={handleSaveAirport}
                  disabled={!homeAirport || savingAirport}
                  className="shrink-0 px-4 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 disabled:opacity-40 transition"
                >
                  {savingAirport ? 'Saving…' : airportSaved ? 'Saved ✓' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Price Alerts ── */}
          {loading ? (
            <div className="text-black/40 dark:text-white/40 text-sm">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
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
                        Max ${alert.max_price}
                        {alert.flexibility && alert.flexibility !== 'anytime' && (
                          <> · {alert.flexibility.charAt(0).toUpperCase() + alert.flexibility.slice(1)}</>
                        )}
                        {alert.trip_days && <> · {alert.trip_days}d trip</>}
                        {' · '}Added {new Date(alert.created_at).toLocaleDateString()}
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
                      <Link
                        href={`/account/edit-alert/${alert.id}`}
                        className="text-xs text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60 transition"
                      >
                        Edit
                      </Link>
                      {alert.is_active ? (
                        <button
                          onClick={() => handleDeactivate(alert.id)}
                          className="text-xs text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60 transition"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(alert.id)}
                          className="text-xs text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60 transition"
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="text-xs text-red-400/60 hover:text-red-500 transition"
                      >
                        Delete
                      </button>
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
