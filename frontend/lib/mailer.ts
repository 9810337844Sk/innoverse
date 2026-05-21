import nodemailer from "nodemailer";

type OtpEmailInput = {
  to: string;
  name: string;
  otp: string;
};

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] || char));
}

export async function sendOtpEmail({ to, name, otp }: OtpEmailInput) {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP email is not configured");
    }

    console.warn(`[email verification] OTP for ${to}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const safeName = escapeHtml(name);

  await transporter.sendMail({
    from,
    to,
    subject: "Verify your PhotoFly account",
    text: `Hi ${name},\n\nYour PhotoFly verification code is ${otp}.\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1A0A12">
        <h2>Verify your PhotoFly account</h2>
        <p>Hi ${safeName},</p>
        <p>Use this code to finish creating your account:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:24px 0">${otp}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}
