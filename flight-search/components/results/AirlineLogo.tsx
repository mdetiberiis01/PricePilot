'use client';

import { useState } from 'react';

interface Props {
  code: string;
  size?: number;
}

export function AirlineLogo({ code, size = 44 }: Props) {
  const [failed, setFailed] = useState(false);

  const inner = size - 12;

  if (!code || failed) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/8 shrink-0"
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-bold text-black/50 dark:text-white/50 tracking-wide">
          {code || '✈'}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-lg bg-white dark:bg-white shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src={`https://www.gstatic.com/flights/airline_logos/70px/${code}.png`}
        alt={code}
        width={inner}
        height={inner}
        onError={() => setFailed(true)}
        className="object-contain"
      />
    </div>
  );
}
