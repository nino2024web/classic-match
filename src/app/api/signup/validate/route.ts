export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type Payload = {
  email?: string;
  callSign?: string;
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
  const trimmedCallSign = payload.callSign?.trim() ?? "";

  if (!trimmedEmail || !trimmedCallSign) {
    return NextResponse.json(
      { message: "呼び名とメールアドレスを入力してください。" },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return NextResponse.json(
      { message: "メールアドレスの形式を確認してください。" },
      { status: 400 }
    );
  }

  if (trimmedCallSign.length > 40) {
    return NextResponse.json(
      { message: "呼び名は40文字以内で入力してください。" },
      { status: 400 }
    );
  }

  const normalizedEmail = trimmedEmail.toLowerCase();
  const normalizedCallSign = trimmedCallSign.toLowerCase();

  try {
    const emailResult = await query(
      "SELECT 1 FROM beta_signups WHERE email = $1 LIMIT 1",
      [normalizedEmail]
    );
    if (emailResult.rowCount > 0) {
      return NextResponse.json(
        { message: "このメールアドレスは登録済みです。" },
        { status: 409 }
      );
    }

    const nameResult = await query(
      "SELECT 1 FROM beta_signups WHERE lower(call_sign) = $1 LIMIT 1",
      [normalizedCallSign]
    );
    if (nameResult.rowCount > 0) {
      return NextResponse.json(
        { message: "この呼び名はすでに使用されています。" },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error("Failed to validate signup", error);
    return NextResponse.json(
      {
        message:
          "登録の事前確認に失敗しました。サーバー設定を確認し、時間をおいて再度お試しください。",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
