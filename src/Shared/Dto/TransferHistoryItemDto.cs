namespace Shared.Dto;

/// <summary>
/// 転送履歴 1 件。
/// </summary>
/// <param name="DestinationId">転送先 ID。</param>
/// <param name="DestinationName">転送先名。</param>
/// <param name="Reason">転送理由。</param>
/// <param name="Result">転送結果。</param>
public record TransferHistoryItemDto(string DestinationId, string DestinationName, string Reason, string Result);
