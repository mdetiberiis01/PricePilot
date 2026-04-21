import { NextRequest, NextResponse } from 'next/server';

const TOKEN = process.env.AVIASALES_TOKEN || '';

// Popular destinations with curated photos and metadata
const DESTINATION_META: Record<string, { city: string; country: string; photo: string; tag?: string }> = {
  NRT: { city: 'Tokyo',        country: 'Japan',          photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', tag: 'Popular' },
  HND: { city: 'Tokyo',        country: 'Japan',          photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', tag: 'Popular' },
  DPS: { city: 'Bali',         country: 'Indonesia',      photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', tag: 'Trending' },
  CDG: { city: 'Paris',        country: 'France',         photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  ORY: { city: 'Paris',        country: 'France',         photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  BCN: { city: 'Barcelona',    country: 'Spain',          photo: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80', tag: 'Hot deal' },
  HKT: { city: 'Phuket',       country: 'Thailand',       photo: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80' },
  BKK: { city: 'Bangkok',      country: 'Thailand',       photo: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80' },
  LHR: { city: 'London',       country: 'UK',             photo: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80' },
  SYD: { city: 'Sydney',       country: 'Australia',      photo: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80' },
  DXB: { city: 'Dubai',        country: 'UAE',            photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
  ICN: { city: 'Seoul',        country: 'South Korea',    photo: 'https://images.unsplash.com/photo-1617369120004-4848bbc79a68?w=600&q=80' },
  SIN: { city: 'Singapore',    country: 'Singapore',      photo: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80' },
  FCO: { city: 'Rome',         country: 'Italy',          photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80' },
  AMS: { city: 'Amsterdam',    country: 'Netherlands',    photo: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80' },
  MEX: { city: 'Mexico City',  country: 'Mexico',         photo: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=80' },
  GRU: { city: 'São Paulo',    country: 'Brazil',         photo: 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=600&q=80' },
  JNB: { city: 'Johannesburg', country: 'South Africa',   photo: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=600&q=80' },
  CPT: { city: 'Cape Town',    country: 'South Africa',   photo: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80' },
  MAD: { city: 'Madrid',       country: 'Spain',          photo: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80' },
  LIS: { city: 'Lisbon',       country: 'Portugal',       photo: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80' },
  ATH: { city: 'Athens',       country: 'Greece',         photo: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&q=80' },
  MNL: { city: 'Manila',       country: 'Philippines',    photo: 'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?w=600&q=80' },
  KUL: { city: 'Kuala Lumpur', country: 'Malaysia',       photo: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80' },
  DEL: { city: 'New Delhi',    country: 'India',          photo: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80' },
  BOM: { city: 'Mumbai',       country: 'India',          photo: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80' },
  LIM: { city: 'Lima',         country: 'Peru',           photo: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=600&q=80' },
  SCL: { city: 'Santiago',     country: 'Chile',          photo: 'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=600&q=80' },
  AKL: { city: 'Auckland',     country: 'New Zealand',    photo: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80' },
  VIE: { city: 'Vienna',       country: 'Austria',        photo: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80' },
  PRG: { city: 'Prague',       country: 'Czech Republic', photo: 'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=600&q=80' },
  IST: { city: 'Istanbul',     country: 'Turkey',         photo: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80' },
};

export interface TrendingApiDest {
  city: string;
  country: string;
  destination: string;
  price: number;
  photo: string;
  tag?: string;
  iata: string;
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get('origin');
  if (!origin || !TOKEN) {
    return NextResponse.json({ destinations: [] });
  }

  try {
    const url = new URL('https://api.travelpayouts.com/v1/prices/cheap');
    url.searchParams.set('origin', origin);
    url.searchParams.set('currency', 'usd');
    url.searchParams.set('token', TOKEN);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error('[trending]', res.status);
      return NextResponse.json({ destinations: [] });
    }

    const data = await res.json();
    if (!data.success || !data.data) {
      return NextResponse.json({ destinations: [] });
    }

    // Deduplicate by city (e.g. NRT + HND both → Tokyo, keep cheapest)
    const seen = new Set<string>();
    const destinations: TrendingApiDest[] = Object.entries(
      data.data as Record<string, { price: number }>
    )
      .filter(([iata]) => DESTINATION_META[iata])
      .map(([iata, flight]) => ({
        ...DESTINATION_META[iata],
        destination: DESTINATION_META[iata].city,
        price: (flight as { price: number }).price,
        iata,
      }))
      .sort((a, b) => a.price - b.price)
      .filter((d) => {
        if (seen.has(d.city)) return false;
        seen.add(d.city);
        return true;
      })
      .slice(0, 6);

    return NextResponse.json({ destinations });
  } catch (err) {
    console.error('[trending]', err);
    return NextResponse.json({ destinations: [] });
  }
}
