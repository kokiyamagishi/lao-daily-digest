# Cloudflare Pages セットアップ手順

ラオス日刊ダイジェスト（Lao Daily Digest）の Web サイトを Cloudflare Pages を使用して自動ホスティング・デプロイするための設定手順です。

## 前提条件

1. プロジェクトが GitHub レポジトリにプッシュされていること。
2. Cloudflare アカウントを所有していること。

## 設定ステップ

### 1. Cloudflare Pages プロジェクトの作成
1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/)にログインします。
2. 左メニューから **「Workers & Pages」** を選択し、**「Create Application」➔ 「Pages」** タブをクリックします。
3. **「Connect to Git」** を選択し、GitHub アカウントと連携して対象のレポジトリを選択します。

### 2. ビルド設定
プロジェクトのビルド設定を以下のように指定します：

| 設定項目 | 指定値 |
| :--- | :--- |
| **Framework preset** | `Vite` (または `None`) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (デフォルト) |

- **「Save and Deploy」** をクリックすると、最初のデプロイが開始されます。

### 3. GitHub Actions との連携
毎日 12:00 PM に GitHub Actions が走り、`src/data/news.json` をコミットしてリポジトリにプッシュすると、Cloudflare Pages がそのコミットを自動的に検知して自動再ビルド ➔ 数分以内に反映します。

## GitHub Secrets の設定
GitHub Actions で Gemini API キーを使用するため、GitHub リポジトリの **Settings ➔ Secrets and variables ➔ Actions** にて、新しい Repository Secret として `GEMINI_API_KEY` を登録してください。
