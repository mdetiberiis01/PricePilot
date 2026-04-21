'use client';

import { useState, useEffect } from 'react';
import { SearchParams } from '@/types/search';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function useSearchForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<SearchParams>({
    origin: '',
    originName: '',
    destination: '',
    flexibility: 'anytime',
    tripDays: 7,
    tripType: 'roundtrip',
    travelers: 1,
    cabinClass: 'economy',
    maxBudget: 0,
  });

  // Auto-fill origin from home airport when user loads (only if origin is still empty)
  useEffect(() => {
    const homeAirport = user?.user_metadata?.home_airport as string | undefined;
    const homeAirportName = user?.user_metadata?.home_airport_name as string | undefined;
    if (homeAirport) {
      setForm((prev) =>
        prev.origin ? prev : { ...prev, origin: homeAirport, originName: homeAirportName ?? homeAirport }
      );
    }
  }, [user]);

  function updateField<K extends keyof SearchParams>(key: K, value: SearchParams[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.origin || !form.destination) {
      setError('Please enter both origin and destination');
      return;
    }

    setError(null);
    setIsLoading(true);

    // Navigate to results page with search params
    const params = new URLSearchParams({
      origin: form.origin,
      originName: form.originName || form.origin,
      destination: form.destination,
      flexibility: form.flexibility,
      tripDays: String(form.tripDays ?? 7),
      ...(form.customDateStart && { customDateStart: form.customDateStart }),
      ...(form.customDateEnd && { customDateEnd: form.customDateEnd }),
    });

    router.push(`/results?${params.toString()}`);
    setIsLoading(false);
  }

  return { form, updateField, handleSubmit, isLoading, error };
}
