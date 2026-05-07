# fsBlog 修正ログ

Supabase + Render デプロイに向けて行った修正の記録。

---

## 1. Volta で Node.js バージョンを固定

**修正ファイル：** `package.json`（voltaフィールド自動追加）

**理由：**  
開発環境とRenderのビルド環境でNode.jsバージョンが異なるとビルドエラーが起きる。  
Voltaを使ってNode.js 20をプロジェクト単位で固定し、環境差異をなくした。

```json
"volta": {
  "node": "20.20.2",
  "npm": "11.13.0"
}
```

---

## 2. Prisma スキーマの修正

**修正ファイル：** `prisma/schema.prisma`

### 2-1. 全角スペースのバグ修正

**理由：**  
`id Int @id　@default(autoincrement())` の `@id` と `@default` の間に全角スペース（U+3000）が混入していた。  
Prismaのパーサーが正しく解釈できず、将来的にエラーになる可能性があった。

```prisma
# 修正前
id Int @id　@default(autoincrement())

# 修正後
id Int @id @default(autoincrement())
```

### 2-2. `directUrl` の追加

**理由：**  
Supabaseはデフォルトでコネクションプーリング（PgBouncer）を使う。  
PgBouncerはマイグレーション（`prisma migrate`）に対応していないため、マイグレーション専用の直接接続URLが必要。  
`url` をアプリ用（port 6543）、`directUrl` をマイグレーション用（port 5432）に分けることで両方に対応した。

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   # アプリの通常接続（pooler）
  directUrl = env("DIRECT_URL")     # マイグレーション専用（直接接続）
}
```

---

## 3. `package.json` に `postinstall` を追加

**修正ファイル：** `package.json`

**理由：**  
Renderのビルド環境では `npm install` 後に自動で `prisma generate` が実行されないと、`@prisma/client` が生成されずAPIが動かない。  
`postinstall` に設定することで `npm install` の直後に自動実行される。

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

---

## 4. `next.config.ts` に `output: "standalone"` を追加

**修正ファイル：** `next.config.ts`

**理由：**  
Renderでは `next start` で起動するとき、`standalone` モードにすると必要なファイルだけを `.next/standalone/` にまとめてくれる。  
起動コマンドが `node .next/standalone/server.js` になり、Renderのメモリ使用量を抑えられる。

```ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

---

## 5. `render.yaml` の作成

**新規ファイル：** `render.yaml`

**理由：**  
Renderのデプロイ設定をコードで管理できるようにした。  
ビルドコマンドにマイグレーション（`prisma migrate deploy`）を含めることで、デプロイのたびにDBが最新状態に保たれる。

```yaml
services:
  - type: web
    name: fsblog
    runtime: node
    buildCommand: npm install && npx prisma migrate deploy && npm run build
    startCommand: node .next/standalone/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: DIRECT_URL
        sync: false
```

---

## 6. APIルートのTypeScriptエラー修正

### 6-1. 不正なimportの削除

**修正ファイル：** `app/api/blog/route.ts`

**理由：**  
`next/dist/server/normalizers/request/segment-prefix-rsc` という Next.js の内部モジュールが import されていたが、一切使われていなかった。  
内部モジュールはNext.jsのバージョンアップで変更される可能性があり、ビルドエラーの原因になる。

### 6-2. 動的ルートの引数型を修正

**修正ファイル：** `app/api/blog/[id]/route.ts`

**理由：**  
Next.js 15以降、動的ルートハンドラの第2引数は `{ params: Promise<{ id: string }> }` 形式に変わった。  
旧来の `RES: NextResponse` のままではTypeScriptの型エラーが出てビルドが失敗する。  
あわせて、URLを `req.url.split("/blog/")[1]` でパースする方法から、`await params` で取得する正式な方法に変更した。

```ts
# 修正前
export const GET = async (req: Request, RES: NextResponse) => {
  const id = parseInt(req.url.split("/blog/")[1]);

# 修正後
export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
```

---

## 7. フロントエンドのURL修正

**修正ファイル：** `app/blog/add/page.tsx`、`app/blog/edit/[id]/page.tsx`

**理由：**  
`http://localhost:3000/api/blog` がハードコードされていた。  
クライアントコンポーネント（`"use client"`）ではブラウザがfetchを実行するため、相対URL（`/api/blog`）を使えばローカル・本番どちらでも動く。  
ハードコードのままだと本番環境でlocalhostに接続しようとしてエラーになる。

```ts
# 修正前
const res = await fetch(`http://localhost:3000/api/blog`, { ... });

# 修正後
const res = await fetch(`/api/blog`, { ... });
```

### 不要なimportの削除（`add/page.tsx`）

**理由：**  
以下の使われていないimportがあり、ビルド警告の原因になっていた。

- `import { handleBuildComplete } from "next/dist/build/adapter/build-complete"`
- `import { HtmlContext } from "next/dist/server/route-modules/pages/vendored/contexts/entrypoints"`
- `import { Hammersmith_One } from "next/font/google"`
- `import { title } from "process"`

---

## 8. `published` カラムのマイグレーション追加

**新規ファイル：** `prisma/migrations/20260506135357_add_published_column/migration.sql`

**理由：**  
既存の2つのマイグレーション（`20251223084629_init`・`20251227052522_init`）には `published` カラムが含まれていなかった。  
Prismaスキーマには `published Boolean @default(false)` があるのにDBテーブルにカラムがない状態だったため、API呼び出し時に `P2022`（カラムが存在しない）エラーが発生していた。  
`prisma migrate dev --name add_published_column` で差分マイグレーションを生成・適用して解消した。

```sql
ALTER TABLE "Post" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false;
```

---

## 9. サーバーサイドfetchのURL環境変数化

**修正ファイル：** `app/page.tsx`、`.env`

**理由：**  
`app/page.tsx` はサーバーコンポーネント（`async function`）でfetchを実行する。  
サーバーサイドでは相対URLが使えないため、絶対URLが必要。  
ハードコードした `http://localhost:3000` のままでは本番でlocalhostに接続しに行ってしまう。  
`NEXT_PUBLIC_SITE_URL` 環境変数で切り出し、本番はRenderのURLを設定する形にした。

```ts
# 修正前
const res = await fetch(`http://localhost:3000/api/blog`, { ... });

# 修正後
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const res = await fetch(`${baseUrl}/api/blog`, { ... });
```

`.env` に追加：
```
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## 10. 記事一覧画面から本文を非表示

**修正ファイル：** `app/page.tsx`

**理由：**  
一覧画面でタイトルと本文（`description`）が両方表示されていた。  
一覧はタイトルと日付だけで十分で、本文は編集画面で確認できるため、一覧の `{post.description}` ブロックを削除した。  
DBからのデータ取得・API・型定義は変更していないため、編集ページの本文表示には影響なし。

---

## Renderに設定すべき環境変数

| 変数名 | 値 | 説明 |
|---|---|---|
| `DATABASE_URL` | `postgresql://...pooler...:6543/postgres` | Supabase Transaction pooler（アプリ用） |
| `DIRECT_URL` | `postgresql://...supabase.co:5432/postgres` | Supabase Direct（マイグレーション用） |
| `NEXT_PUBLIC_SITE_URL` | `https://あなたのサービス名.onrender.com` | 本番のベースURL |
| `NODE_ENV` | `production` | 本番モード指定 |
