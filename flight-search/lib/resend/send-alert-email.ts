import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  return new Resend(apiKey);
}

export async function sendConfirmationEmail(to: string, confirmationUrl: string) {
  const resend = getResend();
  await resend.emails.send({
    from: 'FliteSmart <noreply@flitesmart.com>',
    to,
    subject: 'Confirm Your Email - FliteSmart',
    text: `Thanks for signing up for FliteSmart.\n\nTo finish creating your account, please confirm your email address by visiting the link below:\n\n${confirmationUrl}\n\nOnce your email is verified, you will be able to start searching for the best times to fly and uncover the cheapest date ranges for the destinations you want to visit.\n\nFliteSmart is designed for flexible travelers. Just choose where you are leaving from and the region or city you want to explore, and we will help you find the lowest prices across the best travel dates.\n\nIf you did not create a FliteSmart account, you can safely ignore this email.\n\nSee you in the skies,\nThe FliteSmart Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111; padding: 32px 24px;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 18px; font-weight: 700; letter-spacing: -0.5px;">✈ FliteSmart</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 12px;">Confirm your email address</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
          Thanks for signing up for FliteSmart. To finish creating your account, please confirm your email address by clicking the button below.
        </p>
        <a href="${confirmationUrl}" style="display: inline-block; padding: 14px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 32px;">
          Confirm my email
        </a>
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
          Once your email is verified, you will be able to start searching for the best times to fly and uncover the cheapest date ranges for the destinations you want to visit.
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 32px;">
          FliteSmart is designed for flexible travelers. Just choose where you are leaving from and the region or city you want to explore, and we will help you find the lowest prices across the best travel dates.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 24px;" />
        <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 0 0 16px;">
          If you did not create a FliteSmart account, you can safely ignore this email.
        </p>
        <p style="color: #555; font-size: 14px; margin: 0;">
          See you in the skies,<br />
          <strong>The FliteSmart Team</strong>
        </p>
      </div>
    `,
  });
}

export async function sendPriceAlertEmail(
  to: string,
  origin: string,
  destination: string,
  price: number,
  bookingUrl: string,
) {
  const resend = getResend();
  await resend.emails.send({
    from: 'FliteSmart <alerts@flitesmart.com>',
    to,
    subject: `Price drop: ${origin} → ${destination} now $${price}`,
    text: `A price alert for your route!\n\nRoute: ${origin} → ${destination}\nCurrent price: $${price}\n\nBook now: ${bookingUrl}\n\n— FliteSmart`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <h2 style="margin-bottom: 4px;">Price drop alert</h2>
        <p style="color: #555; margin-top: 0;">A price on your watched route just dropped below your target.</p>
        <table style="width:100%; border-collapse: collapse; margin: 24px 0; background: #f9f9f9; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 12px 16px; color: #555; font-size: 14px;">Route</td>
            <td style="padding: 12px 16px; font-weight: 600;">${origin} → ${destination}</td>
          </tr>
          <tr style="border-top: 1px solid #eee;">
            <td style="padding: 12px 16px; color: #555; font-size: 14px;">Current price</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #16a34a;">$${price}</td>
          </tr>
        </table>
        <a href="${bookingUrl}" style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Book this flight</a>
        <p style="font-size: 12px; color: #999; margin-top: 32px;">— FliteSmart</p>
      </div>
    `,
  });
}

export async function sendDealAlertEmail(
  to: string,
  origin: string,
  destination: string,
  price: number,
  pctBelowAvg: number,
  bookingUrl: string,
) {
  const resend = getResend();
  await resend.emails.send({
    from: 'FliteSmart <alerts@flitesmart.com>',
    to,
    subject: `Flash deal: ${origin} → ${destination} — ${pctBelowAvg}% below average`,
    text: `Unusually cheap deal detected!\n\nRoute: ${origin} → ${destination}\nPrice: $${price} (${pctBelowAvg}% below 12-month average)\n\nBook now: ${bookingUrl}\n\n— FliteSmart`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <h2 style="margin-bottom: 4px;">Flash deal detected ⚡</h2>
        <p style="color: #555; margin-top: 0;">This price is ${pctBelowAvg}% below the 12-month average — unusually cheap.</p>
        <table style="width:100%; border-collapse: collapse; margin: 24px 0; background: #f9f9f9; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 12px 16px; color: #555; font-size: 14px;">Route</td>
            <td style="padding: 12px 16px; font-weight: 600;">${origin} → ${destination}</td>
          </tr>
          <tr style="border-top: 1px solid #eee;">
            <td style="padding: 12px 16px; color: #555; font-size: 14px;">Price</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #16a34a;">$${price}</td>
          </tr>
          <tr style="border-top: 1px solid #eee;">
            <td style="padding: 12px 16px; color: #555; font-size: 14px;">vs. 12-month avg</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #16a34a;">−${pctBelowAvg}%</td>
          </tr>
        </table>
        <a href="${bookingUrl}" style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Book this flight</a>
        <p style="font-size: 12px; color: #999; margin-top: 32px;">— FliteSmart</p>
      </div>
    `,
  });
}
