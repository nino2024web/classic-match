export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  SESSION_COOKIE_NAME,
  validateSessionCookie,
} from "@/lib/session";

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

type ProfileRecord = {
  email: string | null;
  call_sign: string | null;
  top_eras: string[] | null;
  top_moods: string[] | null;
  intro: string | null;
  agreed_rules: boolean | null;
};

export async function GET() {
  const cookieStore = cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const validation = validateSessionCookie(rawSession);

  if (validation.status !== "valid") {
    return NextResponse.json(
      { message: "ログインセッションが無効です。" },
      { status: 401 }
    );
  }

  const signupId = validation.session.signupId;

  let profile: ProfileRecord | undefined;

  try {
    const result = await query<ProfileRecord>(
      `
        SELECT
          COALESCE(bp.email, bs.email) AS email,
          COALESCE(bp.call_sign, bs.call_sign) AS call_sign,
          bp.top_eras,
          bp.top_moods,
          bp.intro,
          bp.agreed_rules
        FROM beta_signups bs
        LEFT JOIN beta_profiles bp ON bp.signup_id = bs.id
        WHERE bs.id = $1
        LIMIT 1
      `,
      [signupId]
    );

    profile = result.rows[0];
  } catch (error) {
    console.error("Failed to load profile data", error);
    return NextResponse.json(
      { message: "プロフィールの取得に失敗しました。" },
      { status: 500 }
    );
  }

  if (!profile) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }

  const eras =
    Array.isArray(profile.top_eras) && profile.top_eras.length > 0
      ? profile.top_eras.filter((item): item is string => typeof item === "string")
      : [];
  const moods =
    Array.isArray(profile.top_moods) && profile.top_moods.length > 0
      ? profile.top_moods.filter((item): item is string => typeof item === "string")
      : [];

  return NextResponse.json(
    {
      status: "ok",
      profile: {
        email: profile.email ?? "",
        callSign: profile.call_sign ?? "",
        eras,
        moods,
        intro: profile.intro ?? "",
        agreed: Boolean(profile.agreed_rules),
      },
    },
    { status: 200 }
  );
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
