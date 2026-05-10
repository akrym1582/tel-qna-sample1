# Copilot Instructions

このファイルはプロジェクトの規約・パターン・ベストプラクティスを記述しています。
コードを生成・レビューする際は必ずこのファイルの内容に従ってください。

> **メンテナンスルール**: コードの構造・技術スタック・規約を変更した場合は、このファイルと `README.md` の両方を必ず更新してください。

---

## プロジェクト概要

電話受付・AI 応答システムの初期フェーズ実装です。

- フロントエンドは最低限必要な画面を提供し、ブラウザからテスト着信を作成できる
- バックエンドは既存の認証・ユーザー管理基盤を保持する
- 将来的に ACS、FAQ ベクトル検索、転送判断 API へ拡張する前提で UI を整理する

```
TemplateApp.slnx
├── src/
│   ├── Shared/          # 共有ライブラリ (Shared.csproj)
│   └── WebApp/          # Web API + React SPA (WebApp.csproj)
│       └── clientapp/   # React フロントエンド
└── tests/               # xUnit テスト (Tests.csproj)
```

---

## バックエンド (ASP.NET 10)

### アーキテクチャ

- **レイヤー構成**: Controller → Service → Repository → Azure Table Storage
- 各レイヤーにインターフェースを定義し、DI コンテナに登録する
- `Shared` プロジェクトに DTO / Models / Repository / Services / Util を配置する
- `WebApp` プロジェクトに Controllers を配置する

### コントローラー規約

- すべてのエンドポイントは `ActionResult<ApiResponseDto<T>>` または `ActionResult<ApiResponseDto>` を返す
- 認証が必要なエンドポイントには `[Authorize]` を付与する
- 認証失敗は `Unauthorized(new ApiResponseDto(false, "メッセージ"))` を返す
- リソース未発見は `NotFound(new ApiResponseDto(false, "メッセージ"))` を返す
- 成功は `Ok(new ApiResponseDto<T>(true, data))` を返す

### サービス規約

- すべての公開メソッドは `async Task<T>` を使う
- `null` チェックは `is null` / `is not null` パターンマッチングを使う
- Entity → DTO 変換は `private static ToDto(entity)` メソッドで行う

### DI 登録 (`Program.cs`)

```csharp
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddSingleton<IUserService, UserService>();
```

### NuGet パッケージ管理

- .NET のパッケージ バージョンはリポジトリ ルートの `Directory.Packages.props` で中央管理する
- 各 `.csproj` の `PackageReference` には `Version` を直書きしない
- C# プロジェクトには `StyleCop.Analyzers` を共通適用する

---

## フロントエンド (React 19 + TypeScript)

### 技術スタック

| ツール | 用途 |
|--------|------|
| Vite | ビルド・開発サーバー |
| TailwindCSS 4 | スタイリング |
| shadcn/ui | UI コンポーネント |
| aspida | 型安全 API 呼び出し |
| oxlint | リンター |
| vitest + @testing-library/react | テスト |

### 画面構成

初期フェーズでは以下を提供する。

- ログイン画面
- ダッシュボード画面
- コール画面
- コール一覧 / 詳細画面
- FAQ 一覧 / 詳細画面
- 転送先一覧 / 詳細画面
- システムプロンプト一覧 / 詳細画面
- システム設定画面

### 実装規約

- `src/pages/` に画面コンポーネントを配置する
- `src/components/AppShell.tsx` を画面共通レイアウトとして使う
- `src/lib/callCenterData.ts` には画面で使う型定義と参照ヘルパーを配置する
- 初期フェーズの画面データは `GET /api/call-center/bootstrap` から取得する
- FAQ / 転送先 / システム設定だけでなく、現在着信の操作やテスト着信作成も call center API 経由で行う
- 文字起こし追加は `POST /api/call-center/current-call/transcript`、AI 応答生成は `POST /api/call-center/current-call/ai-response` を使う
- `src/api/` 配下の aspida 生成物は手動編集しない
- UI に表示するラベル・メッセージ・説明文はすべて日本語で記述する
- `export default` で画面コンポーネントをエクスポートする
- ダイアログ / 通知は `@/lib/alert` を利用し、SweetAlert2 を直接呼び出さない

### データフェッチ

- 既存認証系 API は aspida 経由で利用する
- 初期フェーズの電話受付系 UI は `/api/call-center/bootstrap` のレスポンスを利用する
- FAQ / 転送先 / システム設定の変更は call center 用 API に送信する
- テスト着信は `POST /api/call-center/test-calls`、着信操作は `PUT /api/call-center/current-call/actions/{action}` を使う
- AI 応答は Azure AI Foundry `gpt-realtime-2` を優先利用し、未設定時はサンプル応答へフォールバックする
- 録音アーカイブは Azure Blob Storage `call-recordings` コンテナへ JSON として保存する
- API フェッチは原則 `credentials: 'same-origin'` で Cookie 認証情報を送信する

### 画面追加時の方針

- まず画面要件に沿った UI を追加する
- 次に必要な型を `src/lib/callCenterData.ts` に追加し、更新処理はバックエンドの `CallCenterRepository` に追加する
- call center データは Azure Table Storage の `CallCenterState` テーブルに永続化し、ACS 互換 webhook は `POST /api/acs/events` で受ける
- AI 応答・要約・転送判断は `IAiCallResponseService` に集約し、`CallCenterService` から呼び出す

---

## テスト

### バックエンド

- テストは `tests/` に配置し、`dotnet test tests/Tests.csproj` で実行する
- モックは NSubstitute を使用する

### フロントエンド

- テストは `src/__tests__/` 配下に配置する
- テストの説明文は日本語で記述する
- `AppShell` を使う画面のテストでは `useAuth` と `@/lib/alert` を必要に応じてモックする
- テストは `cd src/WebApp/clientapp && npm run test` で実行する

---

## 開発コマンド

```bash
# フロントエンド依存関係のインストール
cd src/WebApp/clientapp && npm install

# バックエンドビルド
cd /repo-root && dotnet build TemplateApp.slnx

# バックエンドテスト
cd /repo-root && dotnet test tests/Tests.csproj

# フロントエンド起動
cd src/WebApp/clientapp && npm run dev

# フロントエンドビルド
cd src/WebApp/clientapp && npm run build

# フロントエンドリント
cd src/WebApp/clientapp && npm run lint

# フロントエンドテスト
cd src/WebApp/clientapp && npm run test
```
