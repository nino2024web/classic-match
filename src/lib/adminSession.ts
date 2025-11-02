import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE_NAME = "classic-match-admin-session";
const ADMIN_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 hours
const ADMIN_SESSION_MAX_AGE_MS =
  ADMIN_SESSION_MAX_AGE_SECONDS * 1000;

type AdminSessionPayload = {
  issuedAt: number;
};

function getSecret() {
  const secret = process.env.AUTH_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_COOKIE_SECRET が設定されていません。管理者セッションの署名に必要です。"
    );
  }
  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  const secret = getSecret();
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function encodePayload(payload: AdminSessionPayload) {
  return toBase64Url(JSON.stringify(payload));
}

function decodePayload(encoded: string): AdminSessionPayload | null {
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json) as AdminSessionPayload;
    if (typeof parsed.issuedAt !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function createAdminSessionCookie() {
  const payload = encodePayload({
    issuedAt: Date.now(),
  });
  const signature = signPayload(payload);
  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    value: `${payload}.${signature}`,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    },
  };
}

export function validateAdminSessionCookie(
  cookieValue: string | undefined
): boolean {
  if (!cookieValue) {
    return false;
  }

  const [encodedPayload, providedSignature] = cookieValue.split(".");
  if (!encodedPayload || !providedSignature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload);
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const providedBuffer = Buffer.from(providedSignature, "hex");

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return false;
  }

  const payload = decodePayload(encodedPayload);
  if (!payload) {
    return false;
  }

  if (Date.now() - payload.issuedAt >= ADMIN_SESSION_MAX_AGE_MS) {
    return false;
  }

  return true;
}
