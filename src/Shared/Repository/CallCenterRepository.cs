using System.Text.Json;
using Azure;
using Azure.Data.Tables;
using Shared.Dto;

namespace Shared.Repository;

/// <summary>
/// Azure Table Storage に電話受付データを永続化するリポジトリ実装。
/// </summary>
public class CallCenterRepository : ICallCenterRepository
{
    private const string PartitionKey = "CALL_CENTER";
    private const string RowKey = "STATE";
    private const string DataPropertyName = "Data";
    private const string UpdatedBy = "管理者";
    private readonly JsonSerializerOptions _serializerOptions = new(JsonSerializerDefaults.Web);
    private readonly SemaphoreSlim _stateLock = new(1, 1);
    private readonly TableClient _tableClient;

    /// <summary>
    /// <see cref="CallCenterRepository"/> の新しいインスタンスを初期化する。
    /// </summary>
    /// <param name="tableServiceClient">Azure Table Storage のサービスクライアント。</param>
    public CallCenterRepository(TableServiceClient tableServiceClient)
    {
        _tableClient = tableServiceClient.GetTableClient("CallCenterState");
        _tableClient.CreateIfNotExists();
    }

    /// <inheritdoc/>
    public async Task<CallCenterBootstrapDto> GetBootstrapAsync()
    {
        var state = await LoadStateAsync();
        return RecalculateDashboardStats(state);
    }

    /// <inheritdoc/>
    public async Task<FaqItemDto?> UpdateFaqAsync(string faqId, UpdateFaqRequestDto request)
    {
        await _stateLock.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            var faqItems = state.FaqItems.ToList();
            var index = faqItems.FindIndex(faq => string.Equals(faq.Id, faqId, StringComparison.Ordinal));
            if (index < 0)
            {
                return null;
            }

            var updatedFaq = faqItems[index] with
            {
                Question = request.Question,
                Answer = request.Answer,
                Category = request.Category,
                Keywords = request.Keywords.ToList(),
                Enabled = request.Enabled,
                ScoreHint = request.ScoreHint,
                UpdatedAt = GetCurrentTimestamp(),
                UpdatedBy = UpdatedBy,
            };

            faqItems[index] = updatedFaq;
            await SaveStateAsync(state with { FaqItems = faqItems });
            return updatedFaq;
        }
        finally
        {
            _stateLock.Release();
        }
    }

    /// <inheritdoc/>
    public async Task<TransferDestinationDto?> UpdateTransferDestinationAsync(
        string destinationId,
        UpdateTransferDestinationRequestDto request)
    {
        await _stateLock.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            var destinations = state.TransferDestinations.ToList();
            var index = destinations.FindIndex(destination => string.Equals(destination.Id, destinationId, StringComparison.Ordinal));
            if (index < 0)
            {
                return null;
            }

            var updatedDestination = destinations[index] with
            {
                Name = request.Name,
                Type = request.Type,
                Department = request.Department,
                Target = request.Target,
                BusinessHours = request.BusinessHours,
                Priority = request.Priority,
                Hint = request.Hint,
                FallbackName = request.FallbackName,
                Enabled = request.Enabled,
            };

            destinations[index] = updatedDestination;
            await SaveStateAsync(state with { TransferDestinations = destinations });
            return updatedDestination;
        }
        finally
        {
            _stateLock.Release();
        }
    }

    /// <inheritdoc/>
    public async Task<SystemSettingsDto> UpdateSystemSettingsAsync(UpdateSystemSettingsRequestDto request)
    {
        await _stateLock.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            var updatedSettings = new SystemSettingsDto(
                request.BusinessHours,
                request.AfterHoursMessage,
                request.RejectMessage,
                request.AiEnabled,
                request.TestLoginEnabled,
                request.FaqScoreThreshold,
                request.OperatorAssignmentRule);

            await SaveStateAsync(state with { SystemSettings = updatedSettings });
            return updatedSettings;
        }
        finally
        {
            _stateLock.Release();
        }
    }

    /// <inheritdoc/>
    public async Task<CallRecordDto> CreateIncomingCallAsync(CreateTestIncomingCallRequestDto request, string source)
    {
        await _stateLock.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            var archivedRecords = ArchiveCurrentCall(state.IncomingCall, state.CallRecords);
            var receivedAt = GetCurrentTimestamp();
            var normalizedTopic = string.IsNullOrWhiteSpace(request.RequestedTopic)
                ? "ご相談があります。"
                : request.RequestedTopic;
            var customerName = string.IsNullOrWhiteSpace(request.CustomerName)
                ? request.CallerNumber
                : request.CustomerName;
            var customerSummary = string.IsNullOrWhiteSpace(request.CustomerSummary)
                ? "新規着信 / テスト受電"
                : request.CustomerSummary;
            var currentCall = new CallRecordDto(
                Id: $"CALL-{DateTime.UtcNow:yyyyMMdd-HHmmss}",
                CallerNumber: request.CallerNumber,
                ReceivedAt: receivedAt,
                EndedAt: string.Empty,
                Status: "オペレーター選択待ち",
                ResponseMode: "AI",
                OperatorName: "代表電話受付",
                CustomerId: BuildCustomerId(request.CallerNumber),
                CustomerName: customerName,
                CustomerType: string.IsNullOrWhiteSpace(request.CustomerType) ? "不明" : request.CustomerType,
                CustomerSummary: customerSummary,
                AiHandled: false,
                TransferRequired: false,
                TransferDestinationId: null,
                TransferDestinationName: null,
                TransferReason: null,
                AiSummary: "着信を受け付けました。オペレーターまたは AI が応答できます。",
                RecordingLocation: "未保存",
                Transcript:
                [
                    new CallTranscriptLineDto("顧客", normalizedTopic, GetCurrentTimeOnly()),
                ],
                Events:
                [
                    new CallEventDto(GetCurrentTimeOnly(), "着信受付", source, $"{request.CallerNumber} からの着信を取り込みました。"),
                ],
                TransferHistory: []);

            await SaveStateAsync(state with
            {
                IncomingCall = currentCall,
                CallRecords = archivedRecords,
            });
            return currentCall;
        }
        finally
        {
            _stateLock.Release();
        }
    }

    /// <inheritdoc/>
    public async Task<CallRecordDto> ApplyCurrentCallActionAsync(string action)
    {
        CallEventUpdateRequestDto request = action.ToLowerInvariant() switch
        {
            "receive" => new CallEventUpdateRequestDto(
                "オペレーター応答",
                "オペレーター",
                "オペレーターが受電しました。",
                "着信受付中",
                "人間",
                "オペレーターが通話を開始しました。",
                null,
                null),
            "ai" => new CallEventUpdateRequestDto(
                "AI応答開始",
                "AI",
                "AI 応答へ切り替えました。",
                "AI対応中",
                "AI",
                "FAQ の一致候補を確認しながら自動応答を継続しています。",
                null,
                null),
            "reject" => new CallEventUpdateRequestDto(
                "受付終了",
                "オペレーター",
                "お断りメッセージを案内して通話を終了しました。",
                "拒否",
                "人間",
                "お断りメッセージを案内して通話を終了しました。",
                null,
                GetCurrentTimestamp()),
            _ => throw new ArgumentException("未対応の通話操作です。", nameof(action)),
        };

        return await ApplyCurrentCallEventAsync(request);
    }

    /// <inheritdoc/>
    public async Task<CallRecordDto> ApplyCurrentCallEventAsync(CallEventUpdateRequestDto request)
    {
        await _stateLock.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            var currentCall = state.IncomingCall;
            var updatedEvents = currentCall.Events
                .Concat([new CallEventDto(GetCurrentTimeOnly(), request.EventType, request.Actor, request.Detail)])
                .ToList();
            var updatedCall = currentCall with
            {
                Status = request.Status ?? currentCall.Status,
                ResponseMode = request.ResponseMode ?? currentCall.ResponseMode,
                AiSummary = request.AiSummary ?? currentCall.AiSummary,
                RecordingLocation = request.RecordingLocation ?? currentCall.RecordingLocation,
                EndedAt = request.EndedAt ?? currentCall.EndedAt,
                Events = updatedEvents,
                AiHandled = request.ResponseMode is "AI" || currentCall.AiHandled,
            };

            await SaveStateAsync(state with { IncomingCall = updatedCall });
            return updatedCall;
        }
        finally
        {
            _stateLock.Release();
        }
    }

    private async Task<CallCenterBootstrapDto> LoadStateAsync()
    {
        try
        {
            var response = await _tableClient.GetEntityAsync<TableEntity>(PartitionKey, RowKey);
            var json = response.Value.GetString(DataPropertyName);
            if (string.IsNullOrWhiteSpace(json))
            {
                var emptyState = CreateDefaultState();
                await SaveStateAsync(emptyState);
                return emptyState;
            }

            var state = JsonSerializer.Deserialize<CallCenterBootstrapDto>(json, _serializerOptions);
            if (state is not null)
            {
                return state;
            }
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
        }

        var defaultState = CreateDefaultState();
        await SaveStateAsync(defaultState);
        return defaultState;
    }

    private async Task SaveStateAsync(CallCenterBootstrapDto state)
    {
        var normalizedState = RecalculateDashboardStats(state);
        var entity = new TableEntity(PartitionKey, RowKey)
        {
            [DataPropertyName] = JsonSerializer.Serialize(normalizedState, _serializerOptions),
        };
        await _tableClient.UpsertEntityAsync(entity, TableUpdateMode.Replace);
    }

    private static CallCenterBootstrapDto RecalculateDashboardStats(CallCenterBootstrapDto state)
    {
        var allCalls = new[] { state.IncomingCall }.Concat(state.CallRecords).ToList();
        var openCallCount = allCalls.Count(call => string.IsNullOrWhiteSpace(call.EndedAt));
        var transferCount = allCalls.Count(call => call.Status == "転送中");
        var aiCount = allCalls.Count(call => call.AiHandled);
        var todayPrefix = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var todayCount = allCalls.Count(call => call.ReceivedAt.StartsWith(todayPrefix, StringComparison.Ordinal));

        return state with
        {
            DashboardStats =
            [
                new DashboardStatDto("本日の着信件数", $"{todayCount}件"),
                new DashboardStatDto("AI 対応件数", $"{aiCount}件"),
                new DashboardStatDto("転送待ち件数", $"{transferCount}件"),
                new DashboardStatDto("未対応件数", $"{openCallCount}件"),
            ],
        };
    }

    private static IReadOnlyList<CallRecordDto> ArchiveCurrentCall(
        CallRecordDto currentCall,
        IReadOnlyList<CallRecordDto> existingCallRecords)
    {
        if (existingCallRecords.Any(call => call.Id == currentCall.Id))
        {
            return existingCallRecords;
        }

        var archivedCall = currentCall with
        {
            EndedAt = string.IsNullOrWhiteSpace(currentCall.EndedAt) ? GetCurrentTimestamp() : currentCall.EndedAt,
            Status = currentCall.Status is "拒否" or "業務時間外終了" ? currentCall.Status : "通話終了",
        };

        return new[] { archivedCall }.Concat(existingCallRecords).ToList();
    }

    private static string BuildCustomerId(string callerNumber)
    {
        var digits = new string(callerNumber.Where(char.IsDigit).ToArray());
        return digits.Length >= 4 ? $"CUS-{digits[^4..]}" : "CUS-NEW";
    }

    private static string GetCurrentTimestamp() =>
        DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

    private static string GetCurrentTimeOnly() =>
        DateTime.UtcNow.ToString("HH:mm:ss");

    private static CallCenterBootstrapDto CreateDefaultState() =>
        new(
            new CurrentOperatorDto(
                Id: "operator-01",
                Name: "田中 花子",
                Role: "オペレーター",
                Team: "代表電話受付"),
            new SystemSettingsDto(
                BusinessHours: "平日 09:00〜18:00",
                AfterHoursMessage: "営業時間外のため、本日は応答できません。明日の営業時間内におかけ直しください。",
                RejectMessage: "ただいま担当者が応答できないため、お電話を終了いたします。",
                AiEnabled: true,
                TestLoginEnabled: true,
                FaqScoreThreshold: "0.82",
                OperatorAssignmentRule: "先着応答 + 20秒未応答で AI へ自動切替"),
            CreateIncomingCall(),
            CreateCallRecords(),
            CreateFaqItems(),
            CreateTransferDestinations(),
            CreateSystemPrompts(),
            []);

    private static CallRecordDto CreateIncomingCall() =>
        new(
            Id: "CALL-20260510-003",
            CallerNumber: "06-2222-3333",
            ReceivedAt: "2026-05-10 10:15",
            EndedAt: string.Empty,
            Status: "オペレーター選択待ち",
            ResponseMode: "AI",
            OperatorName: "田中 花子",
            CustomerId: "CUS-003",
            CustomerName: "有限会社みなと設備",
            CustomerType: "法人",
            CustomerSummary: "既存顧客 / 保守契約あり / 設備障害の一次受付",
            AiHandled: true,
            TransferRequired: false,
            TransferDestinationId: null,
            TransferDestinationName: null,
            TransferReason: null,
            AiSummary: "保守契約の一次切り分けを行い、障害受付チームへの転送要否を判断する想定。",
            RecordingLocation: "未保存",
            Transcript:
            [
                new CallTranscriptLineDto("顧客", "設備アラートが止まらず困っています。", "10:15:12"),
                new CallTranscriptLineDto("AI", "契約内容を確認しながら対処方法をご案内します。", "10:15:20"),
                new CallTranscriptLineDto("顧客", "保守担当へつないでほしいです。", "10:15:36"),
            ],
            Events:
            [
                new CallEventDto("10:15:01", "着信受付", "ACS", "代表番号への着信を受付"),
                new CallEventDto("10:15:07", "顧客照合", "システム", "電話番号から有限会社みなと設備を特定"),
            ],
            TransferHistory: []);

    private static IReadOnlyList<CallRecordDto> CreateCallRecords() =>
    [
        new CallRecordDto(
            Id: "CALL-20260510-001",
            CallerNumber: "03-1234-5678",
            ReceivedAt: "2026-05-10 10:02",
            EndedAt: "2026-05-10 10:09",
            Status: "転送中",
            ResponseMode: "AI",
            OperatorName: "田中 花子",
            CustomerId: "CUS-001",
            CustomerName: "株式会社青葉商事",
            CustomerType: "法人",
            CustomerSummary: "既存顧客 / 契約プラン: プレミアム / 直近 30 日で 2 回入電",
            AiHandled: true,
            TransferRequired: true,
            TransferDestinationId: "TR-001",
            TransferDestinationName: "営業二課",
            TransferReason: "料金改定に伴う個別見積もり相談のため営業部門へ転送",
            AiSummary: "料金改定の影響と更新条件に関する問い合わせ。FAQで概要説明後、個別条件確認のため営業二課への転送を提案。",
            RecordingLocation: "https://storage.example/calls/CALL-20260510-001.wav",
            Transcript:
            [
                new CallTranscriptLineDto("顧客", "来月更新の見積もり条件を確認したいです。", "10:02:11"),
                new CallTranscriptLineDto("AI", "一般的な更新条件をご案内します。個別見積もりは担当部署へおつなぎできます。", "10:02:26"),
                new CallTranscriptLineDto("顧客", "担当部署につないでください。", "10:02:41"),
                new CallTranscriptLineDto("システム", "営業二課へ転送を開始しました。", "10:02:49"),
            ],
            Events:
            [
                new CallEventDto("10:02:02", "着信受付", "ACS", "代表番号への着信を受付"),
                new CallEventDto("10:02:10", "AI応答開始", "田中 花子", "オペレーターが AI 対応へ切替"),
                new CallEventDto("10:02:48", "転送判断", "AI", "営業二課を候補として選定"),
                new CallEventDto("10:02:49", "転送実行", "システム", "営業二課へ転送開始"),
            ],
            TransferHistory:
            [
                new TransferHistoryItemDto("TR-001", "営業二課", "個別見積もりの相談", "転送中"),
            ]),
        new CallRecordDto(
            Id: "CALL-20260510-002",
            CallerNumber: "090-1111-2222",
            ReceivedAt: "2026-05-10 09:18",
            EndedAt: "2026-05-10 09:23",
            Status: "通話終了",
            ResponseMode: "AI",
            OperatorName: "AI 自動応答",
            CustomerId: "CUS-002",
            CustomerName: "山田 太郎",
            CustomerType: "個人",
            CustomerSummary: "未契約 / FAQ で解決可能な問い合わせが多い顧客",
            AiHandled: true,
            TransferRequired: false,
            TransferDestinationId: null,
            TransferDestinationName: null,
            TransferReason: null,
            AiSummary: "ログイン通知メール未着の問い合わせ。FAQ をもとに再送手順を案内し、顧客の自己解決を確認して終了。",
            RecordingLocation: "https://storage.example/calls/CALL-20260510-002.wav",
            Transcript:
            [
                new CallTranscriptLineDto("顧客", "ログイン通知メールが届きません。", "09:18:14"),
                new CallTranscriptLineDto("AI", "迷惑メールフォルダの確認と再送手順をご案内します。", "09:18:30"),
                new CallTranscriptLineDto("顧客", "再送で解決しました。", "09:19:02"),
            ],
            Events:
            [
                new CallEventDto("09:18:10", "着信受付", "ACS", "代表番号への着信を受付"),
                new CallEventDto("09:18:13", "AI応答開始", "システム", "未応答タイムアウトで AI へ切替"),
                new CallEventDto("09:19:05", "通話終了", "AI", "FAQ 回答で解決して終了"),
            ],
            TransferHistory: []),
        new CallRecordDto(
            Id: "CALL-20260509-014",
            CallerNumber: "080-9999-0000",
            ReceivedAt: "2026-05-09 19:11",
            EndedAt: "2026-05-09 19:12",
            Status: "業務時間外終了",
            ResponseMode: "時間外",
            OperatorName: "時間外ガイダンス",
            CustomerId: "CUS-NEW",
            CustomerName: "未登録番号",
            CustomerType: "不明",
            CustomerSummary: "顧客未登録 / 時間外のため詳細不明",
            AiHandled: false,
            TransferRequired: false,
            TransferDestinationId: null,
            TransferDestinationName: null,
            TransferReason: null,
            AiSummary: "業務時間外メッセージを再生して通話を終了。",
            RecordingLocation: "https://storage.example/calls/CALL-20260509-014.wav",
            Transcript:
            [
                new CallTranscriptLineDto("システム", "営業時間外のため、本日は応答できません。", "19:11:05"),
            ],
            Events:
            [
                new CallEventDto("19:11:02", "着信受付", "ACS", "業務時間外着信"),
                new CallEventDto("19:11:05", "業務時間外終了", "システム", "時間外メッセージを再生して終了"),
            ],
            TransferHistory: []),
    ];

    private static IReadOnlyList<FaqItemDto> CreateFaqItems() =>
    [
        new FaqItemDto(
            Id: "FAQ-001",
            Question: "ログイン通知メールが届かない場合の確認手順は？",
            Answer: "迷惑メールフォルダの確認、受信許可設定、再送操作を案内します。5 分待っても届かない場合は担当部署へ転送します。",
            Category: "ログイン",
            Keywords: ["メール未着", "再送", "ログイン"],
            Enabled: true,
            UpdatedAt: "2026-05-08 13:40",
            UpdatedBy: "FAQ管理者",
            ScoreHint: "0.94"),
        new FaqItemDto(
            Id: "FAQ-002",
            Question: "料金改定に関する一般的な説明は？",
            Answer: "改定時期、対象プラン、通知方法を案内します。個別見積もりは営業部門へ転送します。",
            Category: "料金",
            Keywords: ["料金改定", "見積もり", "更新"],
            Enabled: true,
            UpdatedAt: "2026-05-07 09:15",
            UpdatedBy: "FAQ管理者",
            ScoreHint: "0.88"),
        new FaqItemDto(
            Id: "FAQ-003",
            Question: "保守契約中の障害受付フローは？",
            Answer: "契約番号確認後、一次切り分けを行い、重大障害は保守受付チームへ即時転送します。",
            Category: "保守",
            Keywords: ["障害", "保守", "一次受付"],
            Enabled: false,
            UpdatedAt: "2026-05-01 18:05",
            UpdatedBy: "鈴木 一郎",
            ScoreHint: "0.80"),
    ];

    private static IReadOnlyList<TransferDestinationDto> CreateTransferDestinations() =>
    [
        new TransferDestinationDto(
            Id: "TR-001",
            Name: "営業二課",
            Type: "人間転送",
            Department: "営業本部",
            Target: "03-4000-1200",
            BusinessHours: "平日 09:00〜18:00",
            Priority: 1,
            Hint: "料金改定・個別見積もり・契約更新相談を優先受付",
            FallbackName: "営業一次受付",
            Enabled: true),
        new TransferDestinationDto(
            Id: "TR-002",
            Name: "保守受付チーム",
            Type: "人間転送",
            Department: "カスタマーサポート",
            Target: "03-4000-2200",
            BusinessHours: "24時間",
            Priority: 1,
            Hint: "障害・重大インシデント・保守契約ありの顧客を優先",
            FallbackName: "夜間オンコール",
            Enabled: true),
        new TransferDestinationDto(
            Id: "TR-003",
            Name: "代表折り返しキュー",
            Type: "キュー",
            Department: "代表電話受付",
            Target: "QUEUE-CALLBACK",
            BusinessHours: "平日 09:00〜18:00",
            Priority: 9,
            Hint: "即時転送できない場合のフォールバック",
            FallbackName: "なし",
            Enabled: true),
    ];

    private static IReadOnlyList<SystemPromptDto> CreateSystemPrompts() =>
    [
        new SystemPromptDto(
            Id: "PROMPT-001",
            Name: "代表電話 AI 受付",
            Type: "電話一次受付",
            Version: "v1.3",
            Content: "顧客の用件を短く整理し、FAQ で回答可能な場合のみ簡潔に案内します。解決できない場合は転送先マスタのヒントと営業時間を確認して転送します。",
            Enabled: true,
            UpdatedAt: "2026-05-09 16:20",
            UpdatedBy: "管理者"),
        new SystemPromptDto(
            Id: "PROMPT-002",
            Name: "時間外案内",
            Type: "自動音声",
            Version: "v1.1",
            Content: "現在の営業時間外であること、翌営業日の案内、緊急時の転送先がある場合の説明を丁寧に行います。",
            Enabled: true,
            UpdatedAt: "2026-05-02 11:10",
            UpdatedBy: "管理者"),
        new SystemPromptDto(
            Id: "PROMPT-003",
            Name: "転送判断補助",
            Type: "ルーティング",
            Version: "v0.9",
            Content: "FAQ の一致度が閾値未満の場合は問い合わせカテゴリと顧客属性から転送先候補を優先度順に提案します。",
            Enabled: false,
            UpdatedAt: "2026-04-28 09:05",
            UpdatedBy: "スーパーバイザー"),
    ];
}
