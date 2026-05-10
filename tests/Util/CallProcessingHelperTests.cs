using Shared.Dto;
using Shared.Util;

namespace Tests.Util;

public class CallProcessingHelperTests
{
    [Fact]
    public void FindRelevantFaqs_文字列中間一致で関連FAQを返す()
    {
        var call = CreateCallRecord(
            transcript:
            [
                new CallTranscriptLineDto("顧客", "ログイン通知メールが届きません。", "10:00:01"),
            ]);
        var faqItems = new[]
        {
            new FaqItemDto("FAQ-001", "ログイン通知メールが届かない場合の確認手順は？", "迷惑メールフォルダを確認してください。", "ログイン", ["メール未着", "再送", "ログイン"], true, "2026-05-10 10:00", "管理者", "0.90"),
            new FaqItemDto("FAQ-002", "保守担当への転送方法は？", "担当へ転送します。", "障害", ["保守", "転送"], true, "2026-05-10 10:00", "管理者", "0.80"),
        };

        var result = CallProcessingHelper.FindRelevantFaqs(call, faqItems);

        Assert.NotEmpty(result);
        Assert.Equal("FAQ-001", result[0].Id);
    }

    [Fact]
    public void BuildCustomerSummary_最新の顧客発話を要約する()
    {
        var call = CreateCallRecord(
            transcript:
            [
                new CallTranscriptLineDto("顧客", "設備アラートが止まりません。", "10:00:01"),
                new CallTranscriptLineDto("AI", "確認します。", "10:00:05"),
                new CallTranscriptLineDto("顧客", "保守担当へつないでください。", "10:00:10"),
            ]);

        var result = CallProcessingHelper.BuildCustomerSummary(call, "既存要約");

        Assert.Equal("顧客要件: 設備アラートが止まりません。 / 最新発話: 保守担当へつないでください。", result);
    }

    [Fact]
    public void BuildTranscriptSummary_FAQ候補と最新発話を含める()
    {
        var call = CreateCallRecord(
            transcript:
            [
                new CallTranscriptLineDto("顧客", "ログイン通知メールが届きません。", "10:00:01"),
            ]);
        var matchedFaqs = new[]
        {
            new FaqItemDto("FAQ-001", "ログイン通知メールが届かない場合の確認手順は？", "迷惑メールフォルダを確認してください。", "ログイン", ["メール未着"], true, "2026-05-10 10:00", "管理者", "0.90"),
        };

        var result = CallProcessingHelper.BuildTranscriptSummary(call, matchedFaqs, "既存要約");

        Assert.Contains("FAQ 候補:", result, StringComparison.Ordinal);
        Assert.Contains("ログイン通知メールが届かない場合の確認手順は？", result, StringComparison.Ordinal);
        Assert.Contains("顧客「ログイン通知メールが届きません。", result, StringComparison.Ordinal);
    }

    private static CallRecordDto CreateCallRecord(IReadOnlyList<CallTranscriptLineDto> transcript) =>
        new(
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
            []);
}
