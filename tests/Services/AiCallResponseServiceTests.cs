using Shared.Dto;
using Shared.Services;
using Shared.Util;

namespace Tests.Services;

public class AiCallResponseServiceTests
{
    [Fact]
    public async Task GenerateResponseAsync_未設定時はFAQ中間一致のモック応答を返す()
    {
        var service = new AiCallResponseService(new AiFoundrySettings());
        var bootstrap = CreateBootstrap(
            transcript:
            [
                new CallTranscriptLineDto("顧客", "ログイン通知メールが届きません。", "10:00:01"),
            ],
            faqItems:
            [
                new FaqItemDto("FAQ-001", "ログイン通知メールが届かない場合の確認手順は？", "迷惑メールフォルダの確認と再送手順をご案内します。", "ログイン", ["メール未着", "再送", "ログイン"], true, "2026-05-10 10:00", "管理者", "0.90"),
            ]);

        var result = await service.GenerateResponseAsync(bootstrap);

        Assert.Contains("迷惑メールフォルダの確認と再送手順をご案内します。", result.AssistantReply, StringComparison.Ordinal);
        Assert.Contains("中間一致", result.AiSummary, StringComparison.Ordinal);
        Assert.False(result.TransferRequired);
    }

    [Fact]
    public async Task GenerateResponseAsync_FAQ候補がない場合は転送提案を返す()
    {
        var service = new AiCallResponseService(new AiFoundrySettings());
        var bootstrap = CreateBootstrap(
            transcript:
            [
                new CallTranscriptLineDto("顧客", "個別見積もりを相談したいです。", "10:00:01"),
            ],
            faqItems:
            [
                new FaqItemDto("FAQ-001", "ログイン通知メールが届かない場合の確認手順は？", "迷惑メールフォルダを確認してください。", "ログイン", ["メール未着"], true, "2026-05-10 10:00", "管理者", "0.90"),
            ]);

        var result = await service.GenerateResponseAsync(bootstrap);

        Assert.True(result.TransferRequired);
        Assert.Equal("TR-001", result.TransferDestinationId);
        Assert.Equal("営業二課", result.TransferDestinationName);
    }

    private static CallCenterBootstrapDto CreateBootstrap(
        IReadOnlyList<CallTranscriptLineDto> transcript,
        IReadOnlyList<FaqItemDto> faqItems) =>
        new(
            new CurrentOperatorDto("operator-01", "田中 花子", "オペレーター", "代表電話受付"),
            new SystemSettingsDto("平日 09:00〜18:00", "営業時間外です。", "お断りします。", true, true, "0.82", "先着応答"),
            new CallRecordDto(
                "CALL-001",
                "03-0000-0000",
                "2026-05-10 10:00",
                string.Empty,
                "オペレーター選択待ち",
                "AI",
                "代表電話受付",
                "CUS-001",
                "株式会社青葉商事",
                "法人",
                "既存顧客",
                false,
                false,
                null,
                null,
                null,
                "要約待ち",
                "未保存",
                transcript,
                [],
                []),
            [],
            faqItems,
            [
                new TransferDestinationDto("TR-001", "営業二課", "部門", "営業部", "03-1111-2222", "平日 09:00〜18:00", 1, "見積もり", "代表電話受付", true),
            ],
            [
                new SystemPromptDto("PROMPT-001", "代表電話 AI 受付", "電話一次受付", "v1.0", "顧客の用件を短く整理してください。", true, "2026-05-10 10:00", "管理者"),
            ],
            []);
}
