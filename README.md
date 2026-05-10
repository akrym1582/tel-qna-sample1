# 電話受付・AI応答システム

Azure Communication Services を利用した電話受付・AI 応答システムの初期フェーズ用リポジトリです。React 19 + ASP.NET 10 テンプレートをベースに、Azure Table Storage へ保存される電話受付データ、ACS 互換 webhook を使った着信取り込み、Azure AI Foundry `gpt-realtime-2` を使った AI 応答・要約・録音アーカイブ更新まで確認できる状態にしています。

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

> ブラウザ通話そのものは未実装ですが、`POST /api/acs/events` で ACS / Event Grid 互換イベントを受け取り、`POST /api/call-center/test-calls` でブラウザからテスト着信を作成できます。コール画面から文字起こしの追記と AI 応答生成を行うと、要約と録音アーカイブ JSON を更新できます。

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

- `src/WebApp/Controllers/CallCenterController.cs` が初期フェーズ用の画面データ API を提供
- フロントエンドは `/api/call-center/bootstrap` から画面データを取得する
- `src/WebApp/clientapp/src/lib/callCenterData.ts` はフロントエンド側の型定義と参照ヘルパーを保持する
- AI 応答生成は `POST /api/call-center/current-call/ai-response` から実行し、Azure AI Foundry `gpt-realtime-2` を優先利用する
- FAQ 候補抽出はベクトル検索を使わず、文字起こし・顧客要約に対する文字列中間一致検索で行う
- 文字起こし追加は `POST /api/call-center/current-call/transcript` で行い、音声データを渡した場合は Azure AI Foundry の文字起こし API を優先利用する
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

現時点ではバックエンドの `CallCenterRepository` が Azure Table Storage の `CallCenterState` テーブルへ電話受付状態を永続化し、`GET /api/call-center/bootstrap`、各種更新 API、テスト着信 API、ACS 互換 webhook を提供します。FAQ 候補は文字起こし全文・最新発話・顧客要約に対する文字列中間一致検索で抽出します。
AI 応答は Azure AI Foundry `gpt-realtime-2`、文字起こしは Azure AI Foundry 音声文字起こし API を利用する構成で、未設定時や接続失敗時は既存テキスト入力へフォールバックします。録音はブラウザ音声ストリーム未接続のため、現段階では文字起こし全文・最新発話・要約・イベント・転送情報を含む録音アーカイブ JSON を Blob Storage に保存します。

## 技術スタック

### バックエンド
- ASP.NET 10
- Cookie 認証 + Azure Entra ID
- Azure Table Storage（ユーザー管理 + CallCenterState 永続化）
- Azure Blob Storage（`call-recordings` 録音アーカイブ）
- CallCenter API (`GET /api/call-center/bootstrap`, `PUT /api/call-center/...`)
- テスト着信 / 通話状態更新 API (`POST /api/call-center/test-calls`, `PUT /api/call-center/current-call/actions/{action}`)
- 文字起こし / AI 応答 API (`POST /api/call-center/current-call/transcript`, `POST /api/call-center/current-call/ai-response`)
- ACS / Event Grid 互換 webhook (`POST /api/acs/events`)
- Azure AI Foundry Realtime (`gpt-realtime-2`)
- Azure AI Foundry Audio Transcription (`gpt-4o-mini-transcribe`)
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

### Azurite を使う場合
```bash
azurite --silent --location /tmp/azurite --debug /tmp/azurite/debug.log
```

### Azure AI Foundry 設定
`src/WebApp/appsettings.json` またはユーザー シークレットに以下を設定すると、AI 応答生成 (`gpt-realtime-2`) と音声文字起こし (`gpt-4o-mini-transcribe`) で Azure AI Foundry を利用します。

```json
"AzureAiFoundry": {
  "Endpoint": "https://<resource>.openai.azure.com",
  "Deployment": "gpt-realtime-2",
  "TranscriptionDeployment": "gpt-4o-mini-transcribe",
  "ApiKey": "<api-key>",
  "ApiVersion": "2025-04-01-preview",
  "UseMockWhenUnavailable": true
}
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

## 動作確認用 API

- `POST /api/call-center/test-calls`: 認証済み画面からテスト着信を作成
- `PUT /api/call-center/current-call/actions/receive|ai|reject`: 現在着信の状態を更新
- `POST /api/call-center/current-call/transcript`: 現在着信に顧客 / オペレーター発話を追加（`audioBase64` を含む場合は Azure AI Foundry で文字起こし）
- `POST /api/call-center/current-call/ai-response`: Azure AI Foundry `gpt-realtime-2` で応答・要約・転送判断を生成
- `POST /api/acs/events`: Event Grid 互換の配列 payload を受信して着信 / 接続 / 終話を反映

## 今後の実装候補

- ACS 音声ストリームと録音アーカイブの本格連携
- 録音音声本体の保存と自動文字起こし連携
- 顧客管理、監査ログ、マスタ管理の本実装
