import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
}

export function welcomeEmail(name: string, courseTitle: string, loginUrl: string): string {
  return `
<!DOCTYPE html><html dir="rtl" lang="he"><body style="font-family:sans-serif;background:#f9f9f9;padding:32px">
<div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;padding:40px">
  <h1 style="color:#1a1a2e;margin:0 0 8px">שלום ${name}!</h1>
  <p style="color:#444;font-size:16px">תודה שרכשת את <strong>${courseTitle}</strong>.</p>
  <p style="color:#444">הגישה שלך לקורס מוכנה — לחץ על הכפתור כדי להתחיל:</p>
  <a href="${loginUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">כניסה לקורסים שלי</a>
  <p style="color:#888;font-size:13px">אם לא ביצעת רכישה זו, אנא פנה אלינו.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0">
  <p style="color:#aaa;font-size:12px">ישורון גליקמן | קורסים דיגיטליים</p>
</div></body></html>`;
}

export function purchaseConfirmEmail(name: string, courseTitle: string, amount: number, orderNumber: string): string {
  return `
<!DOCTYPE html><html dir="rtl" lang="he"><body style="font-family:sans-serif;background:#f9f9f9;padding:32px">
<div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;padding:40px">
  <h1 style="color:#1a1a2e">אישור רכישה</h1>
  <p>היי ${name}, קיבלנו את התשלום שלך בהצלחה.</p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0">
    <tr><td style="padding:8px;color:#666">קורס:</td><td style="padding:8px;font-weight:600">${courseTitle}</td></tr>
    <tr style="background:#f5f5f5"><td style="padding:8px;color:#666">מספר הזמנה:</td><td style="padding:8px">${orderNumber}</td></tr>
    <tr><td style="padding:8px;color:#666">סכום:</td><td style="padding:8px">₪${amount}</td></tr>
  </table>
  <p style="color:#888;font-size:13px">שמור אימייל זה כקבלה.</p>
</div></body></html>`;
}
