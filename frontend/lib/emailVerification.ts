import crypto from "crypto";

type VerificationPayload = {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "photographer";
  otpHash: string;
  exp: number;
};

const TOKEN_TTL_MS = 10 * 60 * 1000;

function getSecret() {
  const secret =
    process.env.EMAIL_VERIFICATION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Missing EMAIL_VERIFICATION_SECRET");
  }

  return secret;
}

function getKey() {
  return crypto.createHash("sha256").update(getSecret()).digest();
}

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(otp: string, email: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`${email.toLowerCase().trim()}:${otp.trim()}`)
    .digest("hex");
}

export function createVerificationToken(payload: Omit<VerificationPayload, "exp">) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const body = JSON.stringify({ ...payload, exp: Date.now() + TOKEN_TTL_MS });
  const encrypted = Buffer.concat([cipher.update(body, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv, tag, encrypted].map(part => part.toString("base64url")).join(".");
}

export function readVerificationToken(token: string) {
  const [ivRaw, tagRaw, encryptedRaw] = token.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error("Invalid verification token");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");

  const payload = JSON.parse(decrypted) as VerificationPayload;
  if (payload.exp < Date.now()) {
    throw new Error("Verification code expired");
  }

  return payload;
}

