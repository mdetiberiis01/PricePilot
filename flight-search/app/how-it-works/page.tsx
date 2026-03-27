import Link from 'next/link';

const SECTIONS = [
  {
    icon: '📅',
    title: 'Flexible Date Search',
    desc: 'Search by season (Spring, Summer, Fall, Winter) or Anytime — no need to lock in exact dates to discover great prices. We scan the full window and surface the cheapest results.',
  },
  {
    icon: '📈',
    title: '12-Month Price History',
    desc: 'Every result shows a sparkline of prices over the past year. You can instantly see if a price is a genuine low or just average.',
  },
  {
    icon: '🏷️',
    title: 'Deal Ratings',
    desc: "We compare each price to its 12-month average and label it: Great, Good, Fair, or High. No guessing whether you're getting a deal.",
  },
  {
    icon: '🔔',
    title: 'Price Alerts',
    desc: "Set a max price for any route. We'll email you when prices drop below it, or when we spot an unusually cheap deal.",
  },
];

export default function HowItWorksPage() {
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
              <Link href="/how-it-works" className="text-black dark:text-white">How it works</Link>
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
      <section className="bg-gradient-to-b from-sky-50 via-sky-50/40 to-white dark:from-slate-900 dark:via-slate-900/40 dark:to-[#0a0a0a] pt-16 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4 tracking-tight">
            How FliteSmart works
          </h1>
          <p className="text-black/50 dark:text-white/50 text-lg">
            Four features that help you find cheaper flights, faster.
          </p>
        </div>
      </section>

      <div className="border-t border-black/8 dark:border-white/8" />

      {/* Sections */}
      <section className="bg-white dark:bg-[#0a0a0a] py-20 px-6 flex-1">
        <div className="max-w-3xl mx-auto space-y-6">
          {SECTIONS.map((s, i) => (
            <div
              key={s.title}
              className="flex gap-6 p-7 rounded-2xl border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/15 dark:hover:border-white/20 transition"
            >
              <div className="shrink-0 text-4xl mt-0.5">{s.icon}</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-black/30 dark:text-white/30">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="font-semibold text-lg text-black dark:text-white">{s.title}</h2>
                </div>
                <p className="text-black/55 dark:text-white/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <p className="text-black/50 dark:text-white/50 mb-5 text-sm">Ready to find a deal?</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:bg-black/80 dark:hover:bg-white/80 transition"
          >
            Search flights
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/8 dark:border-white/8 py-8 px-6 text-center text-xs text-black/35 dark:text-white/35">
        © {new Date().getFullYear()} FliteSmart · Prices sourced via Kiwi.com · Not affiliated with any airline
      </footer>

    </div>
  );
}
