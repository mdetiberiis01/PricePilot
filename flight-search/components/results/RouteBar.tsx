'use client';

interface Props {
  from: string;
  to: string;
  stops: number;
  layovers?: string[];
  fromDate?: string;
  toDate?: string;
}

export function RouteBar({ from, to, stops, layovers, fromDate, toDate }: Props) {
  const allDots: (string | null)[] =
    layovers && layovers.length > 0 ? layovers : Array(stops).fill(null);

  return (
    <div className="flex-1 min-w-0 flex items-center gap-1.5">

      {/* Origin dot + labels */}
      <div className="flex flex-col items-center shrink-0 gap-[2px]">
        {fromDate && (
          <span className="text-[9px] text-black/45 dark:text-white/45 leading-none tabular-nums">
            {fromDate}
          </span>
        )}
        <span className="w-[7px] h-[7px] rounded-full bg-black/50 dark:bg-white/70 block" />
        <span className="text-[10px] font-bold text-black/80 dark:text-white/80 leading-none">
          {from}
        </span>
      </div>

      {/* Line + stop dots */}
      <div className="flex-1 flex items-center min-w-0">
        {allDots.length === 0 ? (
          <div className="flex-1 h-px bg-black/15 dark:bg-white/20" />
        ) : (
          <>
            {allDots.map((label, i) => (
              <>
                <div key={`line-${i}`} className="flex-1 h-px bg-black/15 dark:bg-white/20" />
                <div key={`dot-${i}`} className="flex flex-col items-center shrink-0 gap-[2px]">
                  <div className="h-[9px]" />{/* spacer to align with endpoint labels */}
                  <span className="w-[6px] h-[6px] rounded-full bg-black/25 dark:bg-white/40 block" />
                  <span className="text-[9px] leading-none text-black/45 dark:text-white/45 font-medium whitespace-nowrap">
                    {label ?? 'Stop'}
                  </span>
                </div>
              </>
            ))}
            <div className="flex-1 h-px bg-black/15 dark:bg-white/20" />
          </>
        )}
      </div>

      {/* Destination dot + labels */}
      <div className="flex flex-col items-center shrink-0 gap-[2px]">
        {toDate && (
          <span className="text-[9px] text-black/45 dark:text-white/45 leading-none tabular-nums">
            {toDate}
          </span>
        )}
        <span className="w-[7px] h-[7px] rounded-full bg-black/50 dark:bg-white/70 block" />
        <span className="text-[10px] font-bold text-black/80 dark:text-white/80 leading-none">
          {to}
        </span>
      </div>

    </div>
  );
}
