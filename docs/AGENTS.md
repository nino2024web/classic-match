# Repository Guidelines

## Project Structure & Module Organization
Classic Match は Next.js 14（App Router）構成です。UI ルートは `app/` 配下にあり、Server Actions や RSC のデータ取得は同階層に配置します。汎用コンポーネントは `src/components`、hooks は `src/hooks`、サーバーロジック（tRPC ルーター、Auth.js、Prisma クライアント）は `src/server` にまとめます。スキーマとマイグレーションは `prisma/`、シードやツールは `scripts/`、静的アセットは `public/`、ドキュメントは `docs/` に保管します。

## Build, Test, and Development Commands
- `npm install`: 依存関係の導入。更新後も必ず再実行。
- `npm run dev`: Next.js 開発サーバー（Tailwind JIT 付き）を起動。
- `npm run db:migrate`: `prisma migrate dev` ラッパー。pgvector 有効な PostgreSQL に適用。
- `npm run db:generate`: Prisma クライアントの再生成。
- `npm run lint` / `npm run format`: ESLint（TypeScript strict）と Prettier を実行。
- `npm run test` / `npm run test:e2e`: Vitest 単体テストと Playwright E2E。
- `npm run build` → `npm run start`: 本番ビルドとローカル検証。

## Coding Style & Naming Conventions
- TypeScript 5 + ESLint（`eslint-config-next`）をベースに、Lint エラーはゼロでコミット。
- React コンポーネントは PascalCase、hooks/utils は camelCase、環境変数は `NEXT_PUBLIC_*` 以外全てサーバー専用。
- スタイルは Tailwind を基本とし、カスタムトークンは `tailwind.config.ts` や `src/styles` に集約。
- クライアントサイドで状態管理が必要なファイルのみ `"use client"` を宣言し、共有型定義は `types.ts` へ切り出す。

## Testing Guidelines
- Vitest による単体/統合テストは対象ファイルと同階層に `*.test.ts(x)` で配置。
- tRPC や Server Action は `src/server/testing` のヘルパー経由でモック化し、DB 依存を最小化。
- E2E は Playwright（`tests/e2e/**`）で実施し、失敗時のスクリーンショット/動画をアーティファクト化。
- PR 前に `npm run lint && npm run test` を走らせ、長時間テストは CI（Chrome headless）に任せる。

## Commit & Pull Request Guidelines
- Conventional Commits（例: `feat(landing): ...`）を採用。メッセージは命令形、必要なら日本語補足を追記。
- Prisma マイグレーションや Seed の変更は関連コードと同じ PR にまとめ、破壊的変更は説明欄で明示。
- PR では目的、主な変更点、ローカル検証コマンド、スクリーンショットや Lighthouse 指標を記載。リアルタイム機能の検証手順も残す。

## Security & Configuration Tips
- Secrets は `.env.local` などで管理しコミット禁止。Auth.js、Prisma、Redis、WebSocket のキーは Vercel 等のマネージド Env に設定。
- PostgreSQL（pgvector 有効）には Prisma のマイグレーションを通じてアクセスし、適用前にバックアップを取得。
- リアルタイム機能は `src/server/realtime` で抽象化し、キーのローテーションや権限はプラットフォーム側で定期確認。
- PWA 用の `app/manifest.json` と Service Worker を更新した際はバージョン番号を上げ、`npm run build && npm run start` でオフライン挙動を確認。
- 依存の更新は `npm audit` を参考にしつつ、`npm run lint && npm run test && npm run build` を通過させてからマージ。

# AGENTS.md — apps/web スコープ
**Scope**: This file applies to `apps/web/**`. Do NOT modify files outside this tree.

## Setup
- Install deps: `pnpm i`
- Start dev: `pnpm dev`
- Typecheck: `pnpm typecheck`

## Code Style
- Formatter: Prettier (`.prettierrc.toml`)
- Lint: ESLint (`pnpm lint`) — fixable only, no TODO ignore
- Naming: React components `PascalCase`, hooks `use*`

## Commit / PR
- Conventional Commits required (`feat:`, `fix:`, `docs:`)
- PR must include: Summary / Risk & rollback plan / Evidence

## Constraints
- Do NOT touch: `/infra/**`, `/db/migrations/**`
- Migrations: run with `--dry-run` only
- Secrets: never create `.env*` commits

## Checks to run (MUST pass before finishing)
1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test:ci` (coverage ≥ 85%)
4. `pnpm build`