# サインアップ API セットアップ

フロントエンドから PostgreSQL に登録できるよう、以下を準備してください。

## 1. 依存パッケージのインストール

`package.json` に `pg` を追加しました。まだインストールしていない場合は、リポジトリ直下で下記を実行してください。

```bash
npm install
```

## 2. 環境変数の設定

Next.js の API からデータベースに接続するため、`.env.local` などに接続文字列を定義します。

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
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
```

## 4. 動作概要

- `/api/signup/validate`  
  呼び名・メールの重複をチェックします。登録済みの場合は 409 を返します。

- `/api/signup`  
  バリデーション後、パスワードをハッシュ化して `beta_signups` に保存します。重複時は 409、成功すると 201 を返します。

開発期間中はメール送信を行わず、画面に認証コードを表示しています。本番運用時はメール送信ロジックの追加やコード管理テーブルの導入を検討してください。
