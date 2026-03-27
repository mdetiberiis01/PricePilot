import { NextRequest, NextResponse } from 'next/server';
import { getActiveAlerts, markAlerted } from '@/lib/supabase/alerts';
import { orchestrateSearch } from '@/lib/search/orchestrator';
import { sendPriceAlertEmail, sendDealAlertEmail } from '@/lib/resend/send-alert-email';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function shouldAlert(lastAlertedAt: string | null | undefined): boolean {
  if (!lastAlertedAt) return true;
  return Date.now() - new Date(lastAlertedAt).getTime() > SEVEN_DAYS_MS;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const alerts = await getActiveAlerts();
    const results: { id: string; status: string }[] = [];

    for (const alert of alerts) {
      if (!shouldAlert(alert.last_alerted_at)) {
        results.push({ id: alert.id!, status: 'skipped (cooldown)' });
        continue;
      }

      try {
        const searchResults = await orchestrateSearch({
          origin: alert.origin,
          destination: alert.destination,
          flexibility: 'anytime',
        });

        if (searchResults.length === 0) {
          results.push({ id: alert.id!, status: 'no results' });
          continue;
        }

        const best = searchResults.reduce((a, b) => (a.price < b.price ? a : b));
        let alerted = false;

        if (best.price <= alert.max_price) {
          await sendPriceAlertEmail(
            alert.email,
            alert.origin_name || alert.origin,
            best.destinationName || alert.destination,
            best.price,
            best.bookingUrl || 'https://flitesmart.com',
          );
          alerted = true;
        } else if (
          best.dealRating === 'great' &&
          best.dealPercent !== null &&
          best.dealPercent >= 30
        ) {
          await sendDealAlertEmail(
            alert.email,
            alert.origin_name || alert.origin,
            best.destinationName || alert.destination,
            best.price,
            best.dealPercent,
            best.bookingUrl || 'https://flitesmart.com',
          );
          alerted = true;
        }

        if (alerted) {
          await markAlerted(alert.id!);
          results.push({ id: alert.id!, status: 'alerted' });
        } else {
          results.push({ id: alert.id!, status: 'no trigger' });
        }
      } catch (err) {
        console.error(`[alerts/check] error for alert ${alert.id}:`, err);
        results.push({ id: alert.id!, status: 'error' });
      }
    }

    return NextResponse.json({ checked: alerts.length, results });
  } catch (err) {
    console.error('[alerts/check] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
