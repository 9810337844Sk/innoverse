/**
 * Stateless password-reset tokens — AES-256-GCM encrypted, single-use.
 *
 * Single-use guarantee without DB storage:
 *   The token embeds `pSig = HMAC(currentPasswordHash, secret)`.
 *   After the password is changed the new hash produces a different pSig,
 *   so old tokens automatically fail validation.
 */

import crypto from "crypto";

type ResetPayload = {
  email: string;
  exp:   number;
  pSig:  string; // HMAC of the user's current password_hash at issue time
};

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getSecret(): string {
  const s =
    process.env.EMAIL_VERIFICATION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("Missing EMAIL_VERIFICATION_SECRET");
  return s;
}

function getKey(): Buffer {
  return crypto.createHash("sha256").update(getSecret()).digest();
}

/** Bind a reset token to the current password hash so it's invalidated on use. */
export function signPasswordHash(passwordHash: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(passwordHash)
    .digest("hex");
}

/** Create an encrypted, expiring reset token for the given email. */
export function createResetToken(email: string, passwordHash: string): string {
  const iv      = crypto.randomBytes(12);
  const cipher  = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const payload: ResetPayload = {
    email: email.toLowerCase().trim(),
    exp:   Date.now() + TOKEN_TTL_MS,
    pSig:  signPasswordHash(passwordHash),
  };
  const body      = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(body, "utf8"), cipher.final()]);
  const tag       = cipher.getAuthTag();

  return [iv, tag, encrypted].map(p => p.toString("base64url")).join(".");
}

/** Decrypt and validate a reset token. Throws on tamper/expiry. Returns email. */
export function readResetToken(token: string): { email: string; pSig: string } {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid reset token format");
  const [ivRaw, tagRaw, encRaw] = parts;

  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");

  const payload = JSON.parse(decrypted) as ResetPayload;

  if (payload.exp < Date.now()) {
    throw new Error("Reset link has expired. Please request a new one.");
  }

  return { email: payload.email, pSig: payload.pSig };
}

/** Verify the token's password signature still matches (i.e. password hasn't changed yet). */
export function validateResetSignature(pSig: string, currentPasswordHash: string): boolean {
  const expected = signPasswordHash(currentPasswordHash);
  return crypto.timingSafeEqual(Buffer.from(pSig, "hex"), Buffer.from(expected, "hex"));
}
