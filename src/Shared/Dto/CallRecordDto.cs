namespace Shared.Dto;

/// <summary>
/// 通話記録。
/// </summary>
/// <param name="Id">通話 ID。</param>
/// <param name="CallerNumber">発信元電話番号。</param>
/// <param name="ReceivedAt">着信日時。</param>
/// <param name="EndedAt">終了日時。</param>
/// <param name="Status">通話状態。</param>
/// <param name="ResponseMode">応答方式。</param>
/// <param name="OperatorName">対応者名。</param>
/// <param name="CustomerId">顧客 ID。</param>
/// <param name="CustomerName">顧客名。</param>
/// <param name="CustomerType">顧客種別。</param>
/// <param name="CustomerSummary">顧客要約。</param>
/// <param name="AiHandled">AI 対応有無。</param>
/// <param name="TransferRequired">転送要否。</param>
/// <param name="TransferDestinationId">転送先 ID。</param>
/// <param name="TransferDestinationName">転送先名。</param>
/// <param name="TransferReason">転送理由。</param>
/// <param name="AiSummary">AI サマリ。</param>
/// <param name="RecordingLocation">録音データ参照先。</param>
/// <param name="Transcript">文字起こし。</param>
/// <param name="Events">イベント履歴。</param>
/// <param name="TransferHistory">転送履歴。</param>
public record CallRecordDto(
    string Id,
    string CallerNumber,
    string ReceivedAt,
    string EndedAt,
    string Status,
    string ResponseMode,
    string OperatorName,
    string CustomerId,
    string CustomerName,
    string CustomerType,
    string CustomerSummary,
    bool AiHandled,
    bool TransferRequired,
    string? TransferDestinationId,
    string? TransferDestinationName,
    string? TransferReason,
    string AiSummary,
    string RecordingLocation,
    IReadOnlyList<CallTranscriptLineDto> Transcript,
    IReadOnlyList<CallEventDto> Events,
    IReadOnlyList<TransferHistoryItemDto> TransferHistory);
