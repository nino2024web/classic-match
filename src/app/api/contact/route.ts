import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { SESSION_COOKIE_NAME, validateSessionCookie } from "@/lib/session";

type Payload = {
  subject?: string;
  message?: string;
};

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id UUID PRIMARY KEY,
      signup_id UUID NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const validation = validateSessionCookie(rawSession);

  if (validation.status !== "valid") {
    return NextResponse.json({ message: "認証が必要です。" }, { status: 401 });
  }

  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json(
      { message: "送信形式が正しくありません。" },
      { status: 400 }
    );
  }

  const subject = payload.subject?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!subject || !message) {
    return NextResponse.json(
      { message: "件名と内容を入力してください。" },
      { status: 400 }
    );
  }

  if (subject.length > 120) {
    return NextResponse.json(
      { message: "件名は120文字以内で入力してください。" },
      { status: 400 }
    );
  }

  if (message.length > 2000) {
    return NextResponse.json(
      { message: "お問い合わせ内容は2000文字以内で入力してください。" },
      { status: 400 }
    );
  }

  try {
    await ensureTable();
    const id = crypto.randomUUID();
    await query(
      `
        INSERT INTO contact_messages (id, signup_id, email, subject, message)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [id, validation.session.signupId, validation.session.email, subject, message]
    );
  } catch (error) {
    console.error("Failed to store contact request", error);
    return NextResponse.json(
      {
        message: "お問い合わせの保存に失敗しました。しばらくしてから再度お試しください。",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
