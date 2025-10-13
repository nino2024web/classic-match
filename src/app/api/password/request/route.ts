import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

type Payload = {
  email?: string;
};

type SignupRow = {
  id: string;
  email: string;
};

const EMAIL_REGEX =
  /^[\w!#$%&'*+\-/=?^`{|}~.]+@[\w-]+(\.[\w-]+)*\.[A-Za-z]{2,}$/;

const RESET_CODE_LENGTH = 6;
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

function generateResetCode() {
  return Array.from({ length: RESET_CODE_LENGTH }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
}

export async function POST(request: Request) {
  let payload: Payload;

  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json(
      { message: "送信形式が正しくありません。" },
      { status: 400 }
    );
  }

  const trimmedEmail = payload.email?.trim() ?? "";

  if (!trimmedEmail) {
    return NextResponse.json(
      { message: "メールアドレスを入力してください。" },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return NextResponse.json(
      { message: "メールアドレスの形式を確認してください。" },
      { status: 400 }
    );
  }

  const normalizedEmail = trimmedEmail.toLowerCase();

  let signup: SignupRow | undefined;

  try {
    const result = await query<SignupRow>(
      `
        SELECT id, email
        FROM beta_signups
        WHERE email = $1
        LIMIT 1
      `,
      [normalizedEmail]
    );

    signup = result.rows[0];
  } catch (error) {
    console.error("Failed to lookup signup for password reset", error);
    return NextResponse.json(
      {
        message:
          "パスワード再設定の準備に失敗しました。時間をおいて再度お試しください。",
      },
      { status: 500 }
    );
  }

  if (!signup) {
    return NextResponse.json(
      { message: "このメールアドレスの登録が見つかりませんでした。" },
      { status: 404 }
    );
  }

  const code = generateResetCode();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);

  try {
    await query(
      `
        INSERT INTO beta_password_resets (signup_id, email, code_hash, expires_at, consumed)
        VALUES ($1, $2, $3, $4, false)
        ON CONFLICT (signup_id)
        DO UPDATE SET
          code_hash = EXCLUDED.code_hash,
          expires_at = EXCLUDED.expires_at,
          consumed = false,
          updated_at = now()
      `,
      [signup.id, normalizedEmail, codeHash, expiresAt]
    );
  } catch (error) {
    console.error("Failed to store password reset code", error);
    return NextResponse.json(
      {
        message:
          "パスワード再設定コードの保存に失敗しました。データベース設定を確認してください。",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      status: "ok",
      code,
      expiresAt: expiresAt.toISOString(),
    },
    { status: 200 }
  );
}
