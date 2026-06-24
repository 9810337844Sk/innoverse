import nodemailer from "nodemailer";

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function escapeHtml(v: string) {
  return v.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c)
  );
}

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

// ─── Shared email shell ────────────────────────────────────────────────────────

function emailShell(content: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>PhotoFly</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  body{margin:0;padding:0;background:#F0EDF2;font-family:'Inter',Arial,sans-serif}
  img{border:0;line-height:100%;outline:none;text-decoration:none}
  table{border-collapse:collapse!important}
  a{text-decoration:none}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
  @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  @media only screen and (max-width:600px){
    .email-wrapper{padding:0!important}
    .email-card{border-radius:0!important;margin:0!important}
    .mobile-pad{padding-left:24px!important;padding-right:24px!important}
    .otp-box{font-size:36px!important;letter-spacing:12px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F0EDF2;">

<!-- Preview text -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  ${escapeHtml(previewText)}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:#F0EDF2;">
  <tr>
    <td align="center" class="email-wrapper" style="padding:40px 16px;">

      <!-- Card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
        class="email-card"
        style="max-width:560px;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(26,10,18,0.15),0 4px 16px rgba(255,45,120,0.1);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(145deg,#1A0A12 0%,#2D0F1E 60%,#1A0A12 100%);padding:0;">

            <!-- Grid texture row -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);background-size:32px 32px;padding:36px 40px 32px;" class="mobile-pad">

                  <!-- Brand -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>
                        <div style="display:inline-block;font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#fff;font-family:'Inter',Arial,sans-serif;">
                          Photo<span style="color:#FF2D78;">Fly</span>
                        </div>
                      </td>
                      <td align="right">
                        <div style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.35);font-family:'Inter',Arial,sans-serif;">
                          AI Photo Platform
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Rainbow line -->
                  <div style="height:2px;background:linear-gradient(90deg,#FF2D78,#A855F7,#14B8A6);border-radius:2px;margin-top:16px;"></div>

                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:40px 40px 32px;" class="mobile-pad">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1A0A12;padding:24px 40px;" class="mobile-pad">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:12px;color:rgba(255,255,255,0.4);font-family:'Inter',Arial,sans-serif;line-height:1.6;">
                  © ${new Date().getFullYear()} PhotoFly &nbsp;·&nbsp;
                  <a href="#" style="color:rgba(255,45,120,0.7);text-decoration:none;">Privacy Policy</a>
                  &nbsp;·&nbsp;
                  <a href="#" style="color:rgba(255,45,120,0.7);text-decoration:none;">Unsubscribe</a>
                  <br />
                  <span style="color:rgba(255,255,255,0.2);">AI-powered photo delivery platform</span>
                </td>
                <td align="right" style="font-size:18px;font-weight:900;color:rgba(255,255,255,0.08);font-family:'Inter',Arial,sans-serif;vertical-align:top;">
                  📷
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

// ─── OTP / Verification email ──────────────────────────────────────────────────

function otpEmailBody(safeName: string, otp: string): string {
  const digits = otp.split("").map(d =>
    `<span style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;background:linear-gradient(135deg,rgba(255,45,120,0.08),rgba(168,85,247,0.08));border:1.5px solid rgba(255,45,120,0.2);border-radius:12px;font-size:28px;font-weight:900;color:#1A0A12;margin:0 3px;font-family:'Inter',Arial,sans-serif;">${d}</span>`
  ).join("");

  return `
    <!-- Icon -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td>
          <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#FF2D78,#A855F7);border-radius:16px;text-align:center;line-height:56px;font-size:24px;box-shadow:0 8px 24px rgba(255,45,120,0.3);">🔐</div>
        </td>
      </tr>
    </table>

    <!-- Heading -->
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1A0A12;letter-spacing:-0.5px;font-family:'Inter',Arial,sans-serif;">
      Verify your account
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#64748B;line-height:1.6;font-family:'Inter',Arial,sans-serif;">
      Hi ${safeName}, welcome to PhotoFly! Use the code below to complete your sign-up.
    </p>

    <!-- OTP container -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:linear-gradient(135deg,#FFF5F8,#FDF4FF);border:1.5px solid rgba(255,45,120,0.15);border-radius:20px;padding:28px;text-align:center;">
          <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#A855F7;font-family:'Inter',Arial,sans-serif;">
            Your Verification Code
          </p>
          <div class="otp-box" style="font-size:42px;font-weight:900;letter-spacing:16px;color:#1A0A12;font-family:'Inter',Arial,sans-serif;padding-left:16px;">
            ${otp}
          </div>
          <p style="margin:16px 0 0;font-size:12px;color:#94A3B8;font-family:'Inter',Arial,sans-serif;">
            ⏱ Expires in <strong style="color:#FF2D78;">10 minutes</strong>
          </p>
        </td>
      </tr>
    </table>

    <!-- Security note -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      <tr>
        <td style="background:#F8FAFC;border-radius:12px;padding:16px 20px;border-left:3px solid #14B8A6;">
          <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;font-family:'Inter',Arial,sans-serif;">
            <strong style="color:#0F172A;">🛡️ Security notice:</strong> Never share this code with anyone.
            PhotoFly support will never ask for this code. If you didn't create an account,
            you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  `;
}

// ─── Password reset email ──────────────────────────────────────────────────────

function passwordResetEmailBody(safeName: string, resetUrl: string): string {
  return `
    <!-- Icon -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td>
          <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#A855F7,#FF2D78);border-radius:16px;text-align:center;line-height:56px;font-size:24px;box-shadow:0 8px 24px rgba(168,85,247,0.3);">🔑</div>
        </td>
      </tr>
    </table>

    <!-- Heading -->
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1A0A12;letter-spacing:-0.5px;font-family:'Inter',Arial,sans-serif;">
      Reset your password
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#64748B;line-height:1.6;font-family:'Inter',Arial,sans-serif;">
      Hi ${safeName}, we received a request to reset the password for your PhotoFly account.
      Click the button below to create a new password.
    </p>

    <!-- CTA button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${escapeHtml(resetUrl)}" style="height:54px;v-text-anchor:middle;width:280px;" arcsize="30%" stroke="f" fillcolor="#FF2D78"><w:anchorlock/><center><![endif]-->
          <a href="${escapeHtml(resetUrl)}"
            style="display:inline-block;background:linear-gradient(135deg,#FF2D78,#A855F7);color:#fff;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;border-radius:14px;padding:16px 40px;letter-spacing:0.3px;box-shadow:0 8px 24px rgba(255,45,120,0.35),0 2px 8px rgba(255,45,120,0.2);">
            Reset My Password →
          </a>
          <!--[if mso]></center></v:roundrect><![endif]-->
        </td>
      </tr>
    </table>

    <!-- URL fallback -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#F8FAFC;border-radius:12px;padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94A3B8;font-family:'Inter',Arial,sans-serif;">
            Or copy this link
          </p>
          <p style="margin:0;font-size:12px;color:#64748B;word-break:break-all;font-family:'Courier New',monospace;line-height:1.5;">
            ${escapeHtml(resetUrl)}
          </p>
        </td>
      </tr>
    </table>

    <!-- Expiry + security note -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:linear-gradient(135deg,#FFF5F8,#FDF4FF);border:1.5px solid rgba(255,45,120,0.15);border-radius:12px;padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#64748B;line-height:1.7;font-family:'Inter',Arial,sans-serif;">
            ⏱ This link expires in <strong style="color:#FF2D78;">15 minutes</strong>.<br/>
            🔒 It can only be used once — it becomes invalid after your password is changed.<br/>
            🚫 <strong style="color:#0F172A;">Didn't request this?</strong> Your account is safe — just ignore this email.
          </p>
        </td>
      </tr>
    </table>
  `;
}

// ─── Contact-form notification email ──────────────────────────────────────────

function contactEmailBody(name: string, email: string, subject: string, message: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr><td>
        <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#FF2D78,#A855F7);border-radius:16px;text-align:center;line-height:56px;font-size:24px;box-shadow:0 8px 24px rgba(255,45,120,0.3);">💬</div>
      </td></tr>
    </table>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:900;color:#1A0A12;letter-spacing:-0.5px;font-family:'Inter',Arial,sans-serif;">New Contact Message</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#64748B;font-family:'Inter',Arial,sans-serif;">Someone submitted the PhotoFly contact form.</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;border-radius:16px;overflow:hidden;border:1.5px solid rgba(255,45,120,0.12);">
      ${[
        ["From",    escapeHtml(name)],
        ["Email",   escapeHtml(email)],
        ["Subject", escapeHtml(subject)],
      ].map(([label, value], i) => `
        <tr>
          <td style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94A3B8;background:${i % 2 === 0 ? "#FAFBFC" : "#fff"};width:100px;font-family:'Inter',Arial,sans-serif;">${label}</td>
          <td style="padding:12px 16px;font-size:14px;color:#1A0A12;font-weight:600;background:${i % 2 === 0 ? "#FAFBFC" : "#fff"};font-family:'Inter',Arial,sans-serif;">${value}</td>
        </tr>`).join("")}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:linear-gradient(135deg,#FFF5F8,#FDF4FF);border:1.5px solid rgba(255,45,120,0.15);border-radius:16px;padding:20px 24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#A855F7;font-family:'Inter',Arial,sans-serif;">Message</p>
          <p style="margin:0;font-size:14px;color:#334155;line-height:1.8;white-space:pre-wrap;font-family:'Inter',Arial,sans-serif;">${escapeHtml(message)}</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
      <tr>
        <td align="center">
          <a href="mailto:${escapeHtml(email)}"
            style="display:inline-block;background:linear-gradient(135deg,#FF2D78,#A855F7);color:#fff;font-family:'Inter',Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;padding:14px 32px;">
            Reply to ${escapeHtml(name)} →
          </a>
        </td>
      </tr>
    </table>
  `;
}

// ─── Public send functions ─────────────────────────────────────────────────────

export async function sendOtpEmail({ to, name, otp }: { to: string; name: string; otp: string }) {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP not configured");
    console.warn(`[email] OTP for ${to}: ${otp}`);
    return;
  }

  const safeName = escapeHtml(name);
  const html     = emailShell(otpEmailBody(safeName, otp), `${otp} is your PhotoFly verification code`);

  await createTransport().sendMail({
    from:    process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `${otp} — Verify your PhotoFly account`,
    text:    `Hi ${name},\n\nYour PhotoFly verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't create an account, ignore this email.`,
    html,
  });
}

export async function sendContactEmail({
  name, email, subject, message,
}: {
  name: string; email: string; subject: string; message: string;
}) {
  const to = process.env.CONTACT_EMAIL || process.env.SMTP_USER || "groupinnoverse@gmail.com";

  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP not configured");
    console.warn(`[email] Contact form from ${email}: ${message}`);
    return;
  }

  const html = emailShell(
    contactEmailBody(name, email, subject, message),
    `New message from ${name} — ${subject}`,
  );

  await createTransport().sendMail({
    from:     process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo:  email,
    subject:  `[PhotoFly Contact] ${subject}`,
    text:     `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
    html,
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to:       string;
  name:     string;
  resetUrl: string;
}) {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP not configured");
    console.warn(`[email] Password reset for ${to}: ${resetUrl}`);
    return;
  }

  const safeName = escapeHtml(name);
  const html     = emailShell(passwordResetEmailBody(safeName, resetUrl), `Reset your PhotoFly password`);

  await createTransport().sendMail({
    from:    process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your PhotoFly password",
    text:    `Hi ${name},\n\nWe received a request to reset your PhotoFly password.\n\nClick this link to create a new password:\n${resetUrl}\n\nThis link expires in 15 minutes and can only be used once.\n\nIf you didn't request this, you can safely ignore this email.`,
    html,
  });
}
