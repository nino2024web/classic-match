import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "classic-match-session";
export const SESSION_COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60; // 24 hours
const SESSION_MAX_AGE_MS = SESSION_COOKIE_MAX_AGE_SECONDS * 1000;

type SessionPayload = {
  signupId: string;
  email: string;
  issuedAt: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_COOKIE_SECRET が設定されていません。ログインセッションの署名に必要なため、環境変数を追加してください。"
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
  const secret = getAuthSecret();
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function encodePayload(payload: SessionPayload) {
  return toBase64Url(JSON.stringify(payload));
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json) as SessionPayload;
    if (
      typeof parsed.signupId !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.issuedAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function createSessionCookie(signupId: string, email: string) {
  const payload = encodePayload({
    signupId,
    email,
    issuedAt: Date.now(),
  });
  const signature = signPayload(payload);
  return {
    name: SESSION_COOKIE_NAME,
    value: `${payload}.${signature}`,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    },
  };
}

export type SessionValidationResult =
  | { status: "valid"; session: SessionPayload }
  | { status: "expired"; session: SessionPayload }
  | { status: "invalid"; session: null };

export function validateSessionCookie(
  cookieValue: string | undefined
): SessionValidationResult {
  if (!cookieValue) {
    return { status: "invalid", session: null };
  }

  const [encodedPayload, providedSignature] = cookieValue.split(".");
  if (!encodedPayload || !providedSignature) {
    return { status: "invalid", session: null };
  }

  const expectedSignature = signPayload(encodedPayload);
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const providedBuffer = Buffer.from(providedSignature, "hex");

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return { status: "invalid", session: null };
  }

  const payload = decodePayload(encodedPayload);
  if (!payload) {
    return { status: "invalid", session: null };
  }

  if (Date.now() - payload.issuedAt >= SESSION_MAX_AGE_MS) {
    return { status: "expired", session: payload };
  }

  return { status: "valid", session: payload };
}

export function parseSessionCookie(
  cookieValue: string | undefined
): SessionPayload | null {
  const result = validateSessionCookie(cookieValue);
  if (result.status === "valid") {
    return result.session;
  }
  return null;
}
