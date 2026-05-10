namespace Shared.Dto;

/// <summary>
/// 文字起こし 1 行分の表示情報。
/// </summary>
/// <param name="Speaker">話者。</param>
/// <param name="Text">発話内容。</param>
/// <param name="At">発話時刻。</param>
public record CallTranscriptLineDto(string Speaker, string Text, string At);
