'use client';

import { useEffect, useState } from 'react';

export interface TrendingDest {
  city: string;
  country: string;
  destination: string;
  price: number;
  photo: string;
  tag?: string;
}

const STATIC_TRENDING: TrendingDest[] = [
  { city: 'Tokyo',     country: 'Japan',     destination: 'Tokyo',     price: 689, photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', tag: 'Popular' },
  { city: 'Bali',      country: 'Indonesia', destination: 'Bali',      price: 520, photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', tag: 'Trending' },
  { city: 'Paris',     country: 'France',    destination: 'Paris',     price: 430, photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  { city: 'New York',  country: 'USA',       destination: 'New York',  price: 290, photo: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80' },
  { city: 'Barcelona', country: 'Spain',     destination: 'Barcelona', price: 510, photo: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80', tag: 'Hot deal' },
  { city: 'Phuket',    country: 'Thailand',  destination: 'Phuket',    price: 480, photo: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80' },
];

interface Props {
  onSelect: (dest: TrendingDest) => void;
  homeAirport?: string;
}

export function TrendingDestinations({ onSelect, homeAirport }: Props) {
  const [destinations, setDestinations] = useState<TrendingDest[]>(STATIC_TRENDING);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!homeAirport) {
      setDestinations(STATIC_TRENDING);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/trending?origin=${encodeURIComponent(homeAirport)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.destinations?.length >= 3) {
          setDestinations(data.destinations);
        } else {
          setDestinations(STATIC_TRENDING);
        }
      })
      .catch(() => {
        if (!cancelled) setDestinations(STATIC_TRENDING);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [homeAirport]);

  const headerLabel = homeAirport && !loading
    ? `Cheap flights from ${homeAirport}`
    : 'Trending destinations';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-white">{headerLabel}</h2>
        <span className="text-xs text-slate-400 dark:text-white/40 font-medium uppercase tracking-wide">
          Tap to search
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-xl bg-black/8 dark:bg-white/8 animate-pulse"
              />
            ))
          : destinations.map((dest) => (
              <button
                key={dest.city}
                onClick={() => onSelect(dest)}
                className="group relative h-36 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-left"
              >
                {/* Photo */}
                <img
                  src={dest.photo}
                  alt={dest.city}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Tag */}
                {dest.tag && (
                  <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-sky-500 text-white px-2 py-0.5 rounded-full">
                    {dest.tag}
                  </span>
                )}
                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm leading-tight">{dest.city}</p>
                  <p className="text-white/70 text-xs">{dest.country}</p>
                  <p className="text-sky-300 font-semibold text-sm mt-0.5">from ${dest.price}</p>
                </div>
              </button>
            ))}
      </div>
    </div>
  );
}
