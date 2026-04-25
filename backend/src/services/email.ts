// Email service stub. Plug in SES/Postmark/Resend in production.
export async function sendEmail(to: string, subject: string, body: string) {
  console.log(`[email] -> ${to} | ${subject}\n${body}`);
}
