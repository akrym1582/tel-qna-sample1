namespace Shared.Dto;

/// <summary>
/// テスト着信作成リクエスト。
/// </summary>
/// <param name="CallerNumber">発信元電話番号。</param>
/// <param name="CustomerName">顧客名。</param>
/// <param name="CustomerType">顧客種別。</param>
/// <param name="CustomerSummary">顧客要約。</param>
/// <param name="RequestedTopic">問い合わせ内容。</param>
public record CreateTestIncomingCallRequestDto(
    string CallerNumber,
    string CustomerName,
    string CustomerType,
    string CustomerSummary,
    string RequestedTopic);
