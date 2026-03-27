import Link from 'next/link';
import { SearchForm } from '@/components/search/SearchForm';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Site nav */}
      <header className="relative z-10 border-b border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between pr-24">
          <div className="flex items-center gap-10">
            <span className="font-bold text-lg tracking-tight text-black dark:text-white">
              ✈ FliteSmart
            </span>
            <nav className="hidden md:flex items-center gap-7 text-sm text-black/55 dark:text-white/55">
              <Link href="/" className="hover:text-black dark:hover:text-white transition">Flights</Link>
              <Link href="/alerts" className="hover:text-black dark:hover:text-white transition">Price Alerts</Link>
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-3 tracking-tight">
              Fly smarter.
            </h1>
            <p className="text-black/50 dark:text-white/50 text-lg max-w-lg mx-auto">
              Flexible dates, real price history. Know a deal before you book.
            </p>
          </div>
          <SearchForm />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-black/8 dark:border-white/8" />

      {/* Features */}
      <section className="bg-white dark:bg-[#0a0a0a] py-20 px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-black/40 dark:text-white/40 mb-10 text-center">
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
                className="flex gap-5 p-6 rounded-2xl border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/15 dark:hover:border-white/20 transition"
              >
                <span className="text-3xl mt-0.5 shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-black dark:text-white mb-1">{f.title}</h3>
                  <p className="text-black/50 dark:text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/8 dark:border-white/8 py-8 px-6 text-center text-xs text-black/35 dark:text-white/35">
        © {new Date().getFullYear()} FliteSmart · Prices sourced via Kiwi.com · Not affiliated with any airline
      </footer>

    </div>
  );
}
