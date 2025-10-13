import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

type Payload = {
  email?: string;
  code?: string;
  password?: string;
};

type ResetRow = {
  signup_id: string;
  email: string;
  code_hash: string;
  expires_at: string;
  consumed: boolean;
};

type SignupRow = {
  id: string;
  email: string;
  call_sign: string;
};

const EMAIL_REGEX =
  /^[\w!#$%&'*+\-/=?^`{|}~.]+@[\w-]+(\.[\w-]+)*\.[A-Za-z]{2,}$/;

const RESET_CODE_LENGTH = 6;

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
  const code = payload.code?.trim() ?? "";
  const password = payload.password ?? "";

  if (!trimmedEmail || !code || !password) {
    return NextResponse.json(
      { message: "メールアドレス、コード、新しいパスワードを入力してください。" },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return NextResponse.json(
      { message: "メールアドレスの形式を確認してください。" },
      { status: 400 }
    );
  }

  if (code.length !== RESET_CODE_LENGTH || !/^[0-9]+$/.test(code)) {
    return NextResponse.json(
      { message: "認証コードを6桁の数字で入力してください。" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: "新しいパスワードは8文字以上で入力してください。" },
      { status: 400 }
    );
  }

  const normalizedEmail = trimmedEmail.toLowerCase();

  let resetRow: ResetRow | undefined;

  try {
    const result = await query<ResetRow>(
      `
        SELECT signup_id, email, code_hash, expires_at, consumed
        FROM beta_password_resets
        WHERE email = $1
        LIMIT 1
      `,
      [normalizedEmail]
    );

    resetRow = result.rows[0];
  } catch (error) {
    console.error("Failed to load password reset entry", error);
    return NextResponse.json(
      {
        message:
          "パスワード再設定情報の取得に失敗しました。時間をおいて再度お試しください。",
      },
      { status: 500 }
    );
  }

  if (!resetRow) {
    return NextResponse.json(
      { message: "このメールアドレスの再設定リクエストが見つかりません。" },
      { status: 404 }
    );
  }

  if (resetRow.consumed) {
    return NextResponse.json(
      { message: "このパスワード再設定コードはすでに使用されています。" },
      { status: 409 }
    );
  }

  if (new Date(resetRow.expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { message: "認証コードの有効期限が切れています。再発行してください。" },
      { status: 410 }
    );
  }

  const codeValid = await verifyPassword(code, resetRow.code_hash).catch(
    (error) => {
      console.error("Failed to verify password reset code", error);
      return false;
    }
  );

  if (!codeValid) {
    return NextResponse.json(
      { message: "認証コードが一致しません。" },
      { status: 401 }
    );
  }

  const newPasswordHash = await hashPassword(password);

  let signupRow: SignupRow | undefined;

  try {
    const result = await query<SignupRow>(
      `
        UPDATE beta_signups
        SET password_hash = $1
        WHERE id = $2
        RETURNING id, email, call_sign
      `,
      [newPasswordHash, resetRow.signup_id]
    );

    signupRow = result.rows[0];

    await query(
      `
        UPDATE beta_password_resets
        SET consumed = true, updated_at = now()
        WHERE signup_id = $1
      `,
      [resetRow.signup_id]
    );
  } catch (error) {
    console.error("Failed to update password", error);
    return NextResponse.json(
      {
        message:
          "新しいパスワードの保存に失敗しました。データベース設定を確認してください。",
      },
      { status: 500 }
    );
  }

  if (!signupRow) {
    return NextResponse.json(
      {
        message:
          "該当するアカウントが見つかりませんでした。再度お試しください。",
      },
      { status: 404 }
    );
  }

  const sessionCookie = createSessionCookie(signupRow.id, signupRow.email);

  const response = NextResponse.json(
    { status: "ok", callSign: signupRow.call_sign },
    { status: 200 }
  );

  response.cookies.set(sessionCookie.name, sessionCookie.value, {
    ...sessionCookie.options,
  });

  return response;
}
