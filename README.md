# 電話受付・AI応答システム

Azure Communication Services を利用した電話受付・AI 応答システムの初期フェーズ用リポジトリです。現時点では React 19 + ASP.NET 10 テンプレートをベースに、最低限必要な画面をモックデータで確認できる状態にしています。

> **ドキュメントメンテナンスルール**: 技術スタック・アーキテクチャ・画面構成・開発手順を変更した場合は、このファイル (`README.md`) と [`.github/copilot-instructions.md`](.github/copilot-instructions.md) の**両方**を必ず更新してください。

## 初期フェーズで提供する画面

- ログイン画面
- コール画面
- コール一覧画面
- コール詳細画面
- FAQ 一覧 / 詳細画面
- 転送先一覧 / 詳細画面
- システムプロンプト一覧 / 詳細画面
- システム設定画面

> 人間オペレーターのブラウザ通話機能や ACS 実接続は未実装です。初期フェーズでは AI による自動応答 UI、FAQ 参照、転送判断、通話履歴確認の画面プロトタイプを優先しています。

## プロジェクト構成

```
TemplateApp.slnx
├── src/
│   ├── Shared/                        # 共有 DTO / Repository / Service / Util
│   └── WebApp/
│       ├── Controllers/              # 認証・ユーザー API
│       └── clientapp/
│           └── src/
│               ├── components/       # AppShell, ui コンポーネント
│               ├── lib/              # alert, aspida, mock データ
│               ├── pages/            # 各画面コンポーネント
│               └── __tests__/        # vitest テスト
└── tests/                            # xUnit テスト
```

## フロントエンドの実装方針

- `src/WebApp/clientapp/src/lib/callCenterData.ts` に初期フェーズ用のモックデータを集約
- 画面間の導線は `AppShell` のサイドナビゲーションで提供
- UI テキストはすべて日本語
- アラート / 確認ダイアログは `@/lib/alert` を利用
- 既存認証基盤はそのまま利用し、ログイン後に電話受付 UI を表示

## 主なモックデータ

- 通話履歴
- 着信中コール情報
- FAQ
- 転送先マスタ
- システムプロンプト
- システム設定

将来的にはこれらを API + Azure Storage / Search / OpenAI 連携へ置き換える想定です。

## 技術スタック

### バックエンド
- ASP.NET 10
- Cookie 認証 + Azure Entra ID
- Azure Table Storage（既存ユーザー管理）
- xUnit + NSubstitute

### フロントエンド
- React 19 + TypeScript
- Vite
- TailwindCSS 4
- shadcn/ui
- aspida
- oxlint
- vitest + Testing Library

## 開発方法

### 前提条件
- .NET 10 SDK
- Node.js 20+

### フロントエンド依存関係のインストール
```bash
cd src/WebApp/clientapp
npm install
```

### バックエンド起動
```bash
cd src/WebApp
dotnet run
```

### フロントエンド起動
```bash
cd src/WebApp/clientapp
npm run dev
```

### バックエンドテスト
```bash
dotnet test tests/Tests.csproj
```

### フロントエンド検証
```bash
cd src/WebApp/clientapp
npm run lint
npm run test
npm run build
```

## 今後の実装候補

- ACS 着信イベント連携
- FAQ ベクトル検索 API
- AI 応答と転送判断のサーバー実装
- 録音 / 文字起こし / 要約の永続化
- 顧客管理、監査ログ、マスタ管理の本実装
