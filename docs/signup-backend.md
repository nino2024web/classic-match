# サインアップ API セットアップ

フロントエンドから PostgreSQL に登録できるよう、以下を準備してください。

## 1. 依存パッケージのインストール

`package.json` に `pg` を追加しました。まだインストールしていない場合は、リポジトリ直下で下記を実行してください。

```bash
npm install
```

## 2. 環境変数の設定

Next.js の API からデータベースに接続するため、`.env.local` などに接続文字列とセッション署名用のシークレットを定義します。

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
AUTH_COOKIE_SECRET=ランダムな長い文字列
```

## 3. テーブル作成

サインアップ情報を保存するためのテーブルを作成します。重複登録防止のため、メールアドレスと呼び名にユニーク制約を付与しています（呼び名は大小文字を区別しない形でチェックします）。

```sql
CREATE TABLE IF NOT EXISTS beta_signups (
  id            bigserial PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  call_sign     text NOT NULL,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_beta_signups_call_sign_unique
  ON beta_signups (lower(call_sign));

CREATE TABLE IF NOT EXISTS beta_profiles (
  id              bigserial PRIMARY KEY,
  signup_id       bigint NOT NULL UNIQUE REFERENCES beta_signups(id) ON DELETE CASCADE,
  email           text NOT NULL UNIQUE,
  call_sign       text NOT NULL,
  call_sign_lower text NOT NULL,
  top_eras        text[] NOT NULL DEFAULT ARRAY[]::text[],
  top_moods       text[] NOT NULL DEFAULT ARRAY[]::text[],
  intro           text NOT NULL DEFAULT '',
  agreed_rules    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beta_profiles_call_sign_lower
  ON beta_profiles (call_sign_lower);

CREATE TABLE IF NOT EXISTS beta_password_resets (
  id          bigserial PRIMARY KEY,
  signup_id   bigint NOT NULL UNIQUE REFERENCES beta_signups(id) ON DELETE CASCADE,
  email       text NOT NULL UNIQUE,
  code_hash   text NOT NULL,
  expires_at  timestamptz NOT NULL,
  consumed    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

## 4. 動作概要

- `/api/signup/validate`  
  呼び名・メールの重複をチェックします。登録済みの場合は 409 を返します。

- `/api/signup`  
  バリデーション後、パスワードをハッシュ化して `beta_signups` に保存します。重複時は 409、成功すると 201 を返します。

- `/api/profile`  
  README で定義されたオンボーディング項目（呼び名・初期感情タグなど）を `beta_profiles` に保存します。既存レコードがある場合は上書きします。

- `/api/login`  
  メールアドレスとパスワードを検証し、成功時にセッション Cookie（`classic-match-session`）を発行します。

- `/api/password/request`  
  パスワード再設定用に 6 桁コードを生成し、`beta_password_resets` に保存します。開発中はレスポンスでコードを返して画面に表示します。

- `/api/password/reset`  
  6 桁コードと新しいパスワードを検証し、`beta_signups` のパスワードを更新します。成功すると自動的にログイン状態に遷移します。

- `/logout`  
  セッション Cookie を削除し、トップページへリダイレクトします。

- `/session-expired`  
  セッションの有効期限切れ時にメッセージを表示し、5 秒後にトップページ(`/`) へ誘導します。リンクを押せば即時に遷移できます。

- セッション TTL: `classic-match-session` Cookie は 5 分で期限切れになり、再ログインが必要です。

開発期間中はメール送信を行わず、画面に認証コードを表示しています。本番運用時はメール送信ロジックやコード管理テーブルの導入を検討してください。
