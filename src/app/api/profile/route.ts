export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type Payload = {
  email?: string;
  callSign?: string;
  eras?: string[];
  moods?: string[];
  intro?: string;
  agreed?: boolean;
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
  const eras = Array.isArray(payload.eras) ? payload.eras : [];
  const moods = Array.isArray(payload.moods) ? payload.moods : [];
  const intro = payload.intro?.trim() ?? "";
  const agreed = Boolean(payload.agreed);

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

  if (eras.length === 0) {
    return NextResponse.json(
      { message: "好きな時代を少なくとも1つ選択してください。" },
      { status: 400 }
    );
  }

  if (moods.length < 1 || moods.length > 3) {
    return NextResponse.json(
      { message: "感情タグは1〜3個選択してください。" },
      { status: 400 }
    );
  }

  if (!agreed) {
    return NextResponse.json(
      { message: "コミュニティの約束への同意が必要です。" },
      { status: 400 }
    );
  }

  const normalizedEmail = trimmedEmail.toLowerCase();
  const normalizedCallSign = trimmedCallSign.toLowerCase();

  try {
    const signupResult = await query<{ id: string }>(
      "SELECT id FROM beta_signups WHERE email = $1",
      [normalizedEmail]
    );

    if (signupResult.rowCount === 0) {
      return NextResponse.json(
        {
          message:
            "このメールアドレスの登録が見つかりませんでした。先に会員登録を完了してください。",
        },
        { status: 404 }
      );
    }

    const signupId = signupResult.rows[0].id;

    await query(
      `
        INSERT INTO beta_profiles (
          signup_id,
          email,
          call_sign,
          call_sign_lower,
          top_eras,
          top_moods,
          intro,
          agreed_rules
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (signup_id)
        DO UPDATE SET
          call_sign = EXCLUDED.call_sign,
          call_sign_lower = EXCLUDED.call_sign_lower,
          top_eras = EXCLUDED.top_eras,
          top_moods = EXCLUDED.top_moods,
          intro = EXCLUDED.intro,
          agreed_rules = EXCLUDED.agreed_rules,
          updated_at = now()
      `,
      [
        signupId,
        normalizedEmail,
        trimmedCallSign,
        normalizedCallSign,
        eras,
        moods,
        intro,
        agreed,
      ]
    );
  } catch (error) {
    console.error("Failed to upsert profile", error);
    return NextResponse.json(
      {
        message:
          "プロフィールの保存に失敗しました。データベース設定を確認してください。",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok" }, { status: 201 });
}
