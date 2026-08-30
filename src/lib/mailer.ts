import nodemailer from "nodemailer";

/**
 * Gmail SMTP transport. `MAIL_PASS` must be a Google App Password —
 * regular account passwords are rejected by Gmail's SMTP.
 */
let cached: nodemailer.Transporter | null = null;

function getTransport() {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  if (!user || !pass) {
    throw new Error("MAIL_USER and MAIL_PASS must be set to send email");
  }
  if (!cached) {
    cached = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return cached;
}

/** Absolute base URL for links inside emails. */
export function getAppUrl(request?: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (request) return new URL(request.url).origin;
  return "http://localhost:3000";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}) {
  const { to, name, resetUrl, expiresInMinutes } = opts;
  const safeName = escapeHtml(name || "there");
  const safeUrl = escapeHtml(resetUrl);

  const text = [
    `Hi ${name || "there"},`,
    "",
    "We received a request to reset your Campus Recruitment password.",
    `Open this link to choose a new one (valid for ${expiresInMinutes} minutes):`,
    "",
    resetUrl,
    "",
    "If you did not request this, you can safely ignore this email — your password will not change.",
  ].join("\n");

  const html = `
  <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a">
    <h1 style="margin:0 0 4px;font-size:20px;font-weight:600">Campus Recruitment</h1>
    <p style="margin:0 0 24px;font-size:13px;color:#64748b">Password reset request</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Hi ${safeName},</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6">
      We received a request to reset your password. Click the button below to choose a new one.
      This link is valid for <strong>${expiresInMinutes} minutes</strong> and can be used once.
    </p>
    <p style="margin:0 0 24px">
      <a href="${safeUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-size:15px;font-weight:500;padding:12px 24px;border-radius:8px">
        Reset password
      </a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b">Or paste this link into your browser:</p>
    <p style="margin:0 0 24px;font-size:13px;word-break:break-all;color:#334155">${safeUrl}</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
    <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b">
      If you did not request this, you can safely ignore this email — your password will not change.
    </p>
  </div>`;

  await getTransport().sendMail({
    from: `"Campus Recruitment" <${process.env.MAIL_USER}>`,
    to,
    subject: "Reset your Campus Recruitment password",
    text,
    html,
  });
}
