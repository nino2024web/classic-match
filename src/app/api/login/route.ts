import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

type Payload = {
  email?: string;
  password?: string;
};

type SignupRow = {
  id: string;
  email: string;
  password_hash: string;
  call_sign: string;
};

const EMAIL_REGEX =
  /^[\w!#$%&'*+\-/=?^`{|}~.]+@[\w-]+(\.[\w-]+)*\.[A-Za-z]{2,}$/;

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
  const password = payload.password ?? "";

  if (!trimmedEmail || !password) {
    return NextResponse.json(
      { message: "メールアドレスとパスワードを入力してください。" },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return NextResponse.json(
      { message: "メールアドレスの形式を確認してください。" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: "パスワードは8文字以上で入力してください。" },
      { status: 400 }
    );
  }

  const normalizedEmail = trimmedEmail.toLowerCase();

  let signupRow: SignupRow | undefined;

  try {
    const result = await query<SignupRow>(
      `
        SELECT id, email, password_hash, call_sign
        FROM beta_signups
        WHERE email = $1
        LIMIT 1
      `,
      [normalizedEmail]
    );

    signupRow = result.rows[0];
  } catch (error) {
    console.error("Failed to fetch user during login", error);
    return NextResponse.json(
      {
        message:
          "ログイン処理に失敗しました。データベース設定を確認し、再度お試しください。",
      },
      { status: 500 }
    );
  }

  if (!signupRow) {
    return NextResponse.json(
      { message: "メールアドレスまたはパスワードが一致しません。" },
      { status: 401 }
    );
  }

  const passwordValid = await verifyPassword(
    password,
    signupRow.password_hash
  ).catch((error) => {
    console.error("Failed to verify password", error);
    return false;
  });

  if (!passwordValid) {
    return NextResponse.json(
      { message: "メールアドレスまたはパスワードが一致しません。" },
      { status: 401 }
    );
  }

  const sessionCookie = createSessionCookie(
    signupRow.id,
    signupRow.email
  );

  const response = NextResponse.json(
    {
      status: "ok",
      callSign: signupRow.call_sign,
    },
    { status: 200 }
  );

  response.cookies.set(sessionCookie.name, sessionCookie.value, {
    ...sessionCookie.options,
  });

  return response;
}
