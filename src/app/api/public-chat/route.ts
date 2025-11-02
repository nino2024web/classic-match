export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { PUBLIC_CHAT_MAX_LENGTH } from "@/lib/constants";

type DbRow = {
  id: string;
  content: string;
  created_at: string;
};

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS public_chat_messages (
      id UUID PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function GET() {
  try {
    await ensureTable();
    await query(
      `
        DELETE FROM public_chat_messages
        WHERE created_at < NOW() - INTERVAL '24 hours'
      `
    );
    const result = await query<DbRow>(
      `
        SELECT id, content, created_at
        FROM public_chat_messages
        ORDER BY created_at DESC
        LIMIT 100
      `
    );

    return NextResponse.json(
      {
        status: "ok",
        messages: result.rows.map((row: DbRow) => ({
          id: row.id,
          content: row.content,
          createdAt: row.created_at,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch public chat messages", error);
    return NextResponse.json(
      { message: "メッセージの取得に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let payload: { content?: string } | null = null;
  try {
    payload = (await request.json()) as { content?: string } | null;
  } catch {
    return NextResponse.json(
      { message: "送信形式が正しくありません。" },
      { status: 400 }
    );
  }

  const content = payload?.content?.trim() ?? "";
  if (!content) {
    return NextResponse.json(
      { message: "メッセージを入力してください。" },
      { status: 400 }
    );
  }

  if (content.length > PUBLIC_CHAT_MAX_LENGTH) {
    return NextResponse.json(
      { message: `メッセージは${PUBLIC_CHAT_MAX_LENGTH}文字以内で入力してください。` },
      { status: 400 }
    );
  }

  try {
    await ensureTable();
    const id = crypto.randomUUID();
    await query(
      `
        INSERT INTO public_chat_messages (id, content)
        VALUES ($1, $2)
      `,
      [id, content]
    );
    await query(
      `
        DELETE FROM public_chat_messages
        WHERE id IN (
          SELECT id
          FROM public_chat_messages
          ORDER BY created_at DESC
          OFFSET 100
        )
      `
    );

    return NextResponse.json(
      { status: "ok", id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to store public chat message", error);
    return NextResponse.json(
      { message: "メッセージの投稿に失敗しました。" },
      { status: 500 }
    );
  }
}
