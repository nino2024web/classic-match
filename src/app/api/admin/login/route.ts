"use server";

import { NextResponse } from "next/server";

import { createAdminSessionCookie } from "@/lib/adminSession";

type Payload = {
  email?: string;
  password?: string;
};

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL と ADMIN_PASSWORD を .env.local に設定してください。"
    );
  }

  return { email, password };
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

  const submittedEmail = payload.email?.trim() ?? "";
  const submittedPassword = payload.password ?? "";

  if (!submittedEmail || !submittedPassword) {
    return NextResponse.json(
      { message: "メールアドレスとパスワードを入力してください。" },
      { status: 400 }
    );
  }

  let adminEmail: string;
  let adminPassword: string;
  try {
    const credentials = getAdminCredentials();
    adminEmail = credentials.email;
    adminPassword = credentials.password;
  } catch (error) {
    console.error("Admin credentials are not configured", error);
    return NextResponse.json(
      { message: "サーバー設定に不備があります。管理者に連絡してください。" },
      { status: 500 }
    );
  }

  if (
    submittedEmail.toLowerCase() !== adminEmail.toLowerCase() ||
    submittedPassword !== adminPassword
  ) {
    return NextResponse.json(
      { message: "メールアドレスまたはパスワードが一致しません。" },
      { status: 401 }
    );
  }

  const sessionCookie = createAdminSessionCookie();
  const response = NextResponse.json({ status: "ok" }, { status: 200 });
  response.cookies.set(sessionCookie.name, sessionCookie.value, {
    ...sessionCookie.options,
  });
  return response;
}
