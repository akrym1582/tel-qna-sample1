namespace Shared.Dto;

/// <summary>
/// AI 応答生成結果。
/// </summary>
/// <param name="AssistantReply">AI の応答本文。</param>
/// <param name="AiSummary">AI が生成した要約。</param>
/// <param name="TransferRequired">転送要否。</param>
/// <param name="TransferDestinationId">転送先 ID。</param>
/// <param name="TransferDestinationName">転送先名。</param>
/// <param name="TransferReason">転送理由。</param>
public record AiCallResponseDto(
    string AssistantReply,
    string AiSummary,
    bool TransferRequired,
    string? TransferDestinationId,
    string? TransferDestinationName,
    string? TransferReason);
