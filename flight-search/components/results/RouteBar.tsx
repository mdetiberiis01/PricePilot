'use client';

function formatStopDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface Props {
  from: string;
  to: string;
  stops: number;
  layovers?: string[];
  layoverDurations?: number[];
  fromDate?: string;
  toDate?: string;
}

export function RouteBar({ from, to, stops, layovers, layoverDurations, fromDate, toDate }: Props) {
  const allDots: (string | null)[] =
    layovers && layovers.length > 0 ? layovers : Array(stops).fill(null);

  const hasDate = !!fromDate || !!toDate;

  return (
    <div className="flex-1 min-w-0 flex items-center gap-1">

      {/* Origin */}
      <div className="flex flex-col items-center shrink-0 gap-[2px]">
        <span className="text-[9px] text-black/45 dark:text-white/45 leading-none tabular-nums whitespace-nowrap h-[11px] flex items-center">
          {fromDate ?? ''}
        </span>
        <span className="w-[7px] h-[7px] rounded-full bg-black/50 dark:bg-white/70 block" />
        <span className="text-[10px] font-bold text-black/80 dark:text-white/80 leading-none">{from}</span>
      </div>

      {/* Line + stop dots */}
      <div className="flex-1 flex items-center min-w-0">
        {allDots.length === 0 ? (
          <div className="flex-1 h-px bg-black/15 dark:bg-white/20" />
        ) : (
          allDots.map((label, i) => (
            <div key={i} className="contents">
              <div className="flex-1 h-px bg-black/15 dark:bg-white/20" />
              <div className="flex flex-col items-center shrink-0 gap-[2px]">
                {/* Always reserve the same height as the date label above */}
                <span className="h-[11px] block" />
                <span className="w-[6px] h-[6px] rounded-full bg-black/25 dark:bg-white/40 block" />
                {label && (
                  <span className="text-[9px] leading-none text-black/45 dark:text-white/45 font-medium whitespace-nowrap">
                    {label}
                  </span>
                )}
                {layoverDurations?.[i] != null && (
                  <span className="text-[8px] leading-none text-black/30 dark:text-white/30 whitespace-nowrap tabular-nums">
                    {formatStopDuration(layoverDurations[i])}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        {allDots.length > 0 && <div className="flex-1 h-px bg-black/15 dark:bg-white/20" />}
      </div>

      {/* Destination */}
      <div className="flex flex-col items-center shrink-0 gap-[2px]">
        <span className="text-[9px] text-black/45 dark:text-white/45 leading-none tabular-nums whitespace-nowrap h-[11px] flex items-center">
          {toDate ?? ''}
        </span>
        <span className="w-[7px] h-[7px] rounded-full bg-black/50 dark:bg-white/70 block" />
        <span className="text-[10px] font-bold text-black/80 dark:text-white/80 leading-none">{to}</span>
      </div>

    </div>
  );
}
