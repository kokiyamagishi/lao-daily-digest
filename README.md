# ラオス日刊ニュースダイジェスト 自動配信・公開システム 構築ガイド

本フォルダには、Googleドライブに自動保存されるニュースダイジェストを、Cloudflareのインフラを利用して世界最高速かつ自動でWeb公開するためのプログラムコード一式が含まれています。

## 📁 フォルダ構成
- `worker.js`: Cloudflare Workers (API/サーバーレス関数。CORS対応済み)
- `gas_script.gs`: Google Apps Script (ドキュメントを読み込んでWorkersへ送信する自動スクリプト)
- `src/App.jsx`: React フロントエンドコンポーネント (Tailwind CSS、簡易Markdownパーサー、アドセンス広告スペース付き)
- `wrangler.toml`: Cloudflare Workers の設定ファイル (テンプレート)

---

## 🛠️ ステップ1: Cloudflare Workers ＆ KV (データベース) の設定

### 1. ローカル開発環境の準備 (またはCloudflareダッシュボードでの作成)
Wrangler CLIを使用して簡単にデプロイできます。端末で以下を実行します：
```bash
# ログイン
npx wrangler login

# KV（データベース）名前空間の作成
npx wrangler kv:namespace create NEWS_KV
```
実行結果に表示される `id` を `wrangler.toml` の `id = "YOUR_KV_NAMESPACE_ID"` 部分にコピーします。

### 2. シークレットキー（API認証キー）の設定
GASからの不正なPOST送信を防ぐため、認証用のAPIキーを安全に設定します：
```bash
npx wrangler secret put API_SECRET_KEY
# 任意の強固なパスワード/トークン文字列を入力します。
```
※このシークレットキーは、後ほどGoogle Apps Script側でも使用します。

### 3. Workersのデプロイ
```bash
npx wrangler deploy
```
デプロイ完了後、`https://lao-digest-api.<サブドメイン>.workers.dev` のようなAPIエンドポイントURLが発行されます。

---

## 🔑 ステップ2: Google Apps Script (GAS) の設定

1. [Google ドライブ](https://drive.google.com/)、またはスプレッドシートやGASスタンドアロンエディタを開きます。
2. `gas_script.gs` の内容をコピー＆ペーストします。
3. 以下の定数を書き換えます：
   - `CLOUDFLARE_WORKER_URL`: デプロイされたWorkersのAPIエンドポイントURL（例: `https://lao-digest-api.xxxx.workers.dev/api/update`）
   - `API_SECRET_KEY`: ステップ1の `API_SECRET_KEY` に設定した強固な文字列。
4. **トリガー（タイマー）の設定:**
   - エディタ左メニューの「トリガー（時計アイコン）」を選択。
   - 「トリガーを追加」し、実行関数に `postDailyDigestToCloudflare`、イベントソースに「時間主導型」、タイマーを「日別タイマー」に設定。
   - 時刻は、毎日のニュース生成が完了した直後の時間帯（例: **午後12時〜1時**）に指定します。

---

## 💻 ステップ3: React フロントエンド（Cloudflare Pages）の設定

### 1. Vite + React プロジェクトの立ち上げ (ローカル)
```bash
npm create vite@latest lao-digest-web -- --template react
cd lao-digest-web
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
 Tailwind CSSの設定をして、`App.jsx` を本フォルダ内の `App.jsx` に差し替えます。

### 2. API接続先の変更
`App.jsx` 内の `API_ENDPOINT` 定数を、ご自身の Workers の `https://<名前>.<サブドメイン>.workers.dev/api/latest` に変更します。

### 3. Cloudflare Pages へのデプロイ
1. プロジェクトを GitHub / GitLab にコミット＆プッシュします。
2. Cloudflare ダッシュボードにログインし、「Workers & Pages」 ➡ 「Pages」 ➡ 「Connect to Git」を選択。
3. 対象リポジトリを選択し、以下のビルド設定を行います：
   - フレームワークプリセット: `Vite`
   - ビルドコマンド: `npm run build`
   - 出力ディレクトリ: `dist`
4. デプロイボタンを押すと、自動的にWeb上にビルド・公開されます。

---

## 📈 将来的な収益化（Google AdSense 等）とSEOの設定

1. **独自ドメインの割り当て (強く推奨):**
   - Cloudflare Pages の設定画面「Custom Domains」から、ご自身の独自ドメイン（例: `news.issarapon.com` 等）を紐付けます。ドメイン管理もCloudflareにあるため、1クリックでCNAMEレコードが自動設定されます。
2. **Google AdSense の申請とコード挿入:**
   - AdSenseの審査に通過したら、提供される自動広告スクリプトタグを、Reactプロジェクトの `index.html` の `<head>` 内に挿入します。
   - `App.jsx` 内にある `【広告スペース】` のコンポーネント（ヘッダーバナー、サイドバーレクタングル）部分に、AdSenseのユニットコードを流し込みます。
3. **ads.txt の配置:**
   - AdSenseに必須な `ads.txt` ファイルは、Reactプロジェクトの `public/ads.txt` として配置します。ビルド時にルート（`https://news.issarapon.com/ads.txt`）へ自動配置され、クローラーが正しく認識できるようになります。
