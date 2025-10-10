# Pre-Signup Landing Plan

## 1. 目的とメッセージ
- **ゴール**: 会員登録前のユーザーに価値を即伝え、主要 CTA（無料登録）への遷移率を最大化する。  
- **訴求軸**: 「クラシックマッチが提供する即時マッチング」「高品質なクラシック音楽コミュニティ」「AI・レコメンドによる最適化」。  
- **想定ユーザー**: 音楽家・主催者・ファン。最初のリリースは演奏者とイベント主催者を中心に設定。

## 2. グローバル要素
- **ヘッダー**: ロゴ、ナビ（機能、料金、よくある質問、ログイン）、右端 CTA「無料で始める」。スクロール時は縮小・固定。  
- **フッター**: 会社情報、利用規約、プライバシー、サポートメール、SNS、言語切り替え（将来対応）。  
- **メタ**: App Router の `app/(public)/layout.tsx` で PWA manifest、OG 画像、構造化データ（BreadcrumbList）を宣言。

## 3. セクション構成とワイヤーフレーム
```
| Hero |
| Value Prop Tabs |
| How It Works |
| Showcase / Social Proof |
| Pricing |
| FAQ |
| Sticky CTA |
```

### Hero（ファーストビュー）
- **位置**: 100vh 近くまでの Hero。左: キャッチコピー「クラシック音楽の出会いを、もっと簡単に。」サブコピーで価値訴求。CTA ボタン（Primary: 無料登録 → `/signup`、Secondary: デモを見る → モーダル/動画）。  
- **右**: ビジュアル（演奏シーン写真＋ダッシュボード UI モックアップ）。`next/image` で最適化。  
- **Form パーツ（任意）**: メールアドレス入力付き CTA を Server Action で仮登録し、Auth.js の共有ロジックへ接続。

### Value Proposition
- **形式**: 3 カラムのアイコン＋テキスト。例:  
  1. 「AI マッチング」→ イベントと演奏者の自動レコメンド。  
  2. 「安全な決済・契約」→ Stripe/Escrow 等の言及。  
  3. 「プロのコミュニティ」→ 審査とレビュー制度。  
- **実装**: `components/landing/FeatureCards.tsx` などで切り出し、CMS 化も想定。

### How It Works
- **3 ステップ**: 1) プロフィール作成 → 2) マッチ提案 → 3) 成約・リハーサル調整。各ステップにアイコンと補足。  
- **CTA**: 下部に「無料で始める」ボタンを再配置。

### Showcase / Social Proof
- **成功事例**: 2〜3 件のイベント実績、演奏者のコメント。カード型で `pgvector` を活用した推薦例を掲載。  
- **数値**: 「成約率 85%」「審査済み演奏者 1,200 名」など KPI を列挙。  
- **リアルタイム情報**: Socket.IO/Ably で「今登録中の演奏者」「開催予定」のマイクロアニメーションを表示する余地。

### Pricing
- **無料/有料プランの比較**: テーブル形式で機能差を明記。Stripe Checkout への導線は未ログイン時は登録フローへ誘導。  
- **将来の PWA**: 料金テーブルはモバイル時にタブ表示。

### FAQ
- **構造**: アコーディオン。Auth（登録には何が必要か）、利用料金、審査プロセスなど。  
- **サポート導線**: `mailto:` と Discord/Slack コミュニティ招待リンク。

### Sticky CTA / フッター前のクローズ
- スクロール終盤で CTA バナー。「クラシックマッチであなたの次のステージを見つけよう。」登録ボタンとログインリンク。

## 4. 認証導線とルーティング
- **Primary CTA**: `/signup` → Auth.js の email/password + OAuth（Google、Apple）を想定。Server Action で Prisma を介して `User` を仮登録。  
- **Secondary CTA**: 「デモを見る」→ `/demo` でダッシュボードのノンインタラクティブ preview、またはモーダル＋動画。  
- **ログイン導線**: ヘッダーとフッターの `ログイン` → `/login`。  
- **守るべき UX**: どの CTA でも Next.js App Router の `redirect` を活用し、未確認メールの場合は `/verify` に遷移。PWA の `navigator.credentials` 連携を将来的に検討。

## 5. コンテンツ管理と将来拡張
- コピー・FAQ・料金表は `content/landing.ts` にまとめ、RSC から直接読み込む構造にすると CMS なしでも更新が容易。  
- 将来の多言語対応は `next-intl` や `@lingui` を採用し、翻訳キーを最初から `landing.hero.title` のように設計。  
- PWA/モバイルラッパー対応のため、Hero 画像や動画は WebP/MP4 に統一し、`<link rel="apple-touch-icon">` も設定。

## 6. 次のアクション
1. 本ドキュメントを基に、Figma でハイレベルなワイヤーフレームを作成。  
2. コンポーネント粒度を決め、`components/landing` 以下にディレクトリ構造を設計。  
3. コピーライティングと KPI 数値の決定後、Next.js 実装を開始。
