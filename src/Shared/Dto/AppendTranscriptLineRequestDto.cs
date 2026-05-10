namespace Shared.Dto;

/// <summary>
/// 現在着信の文字起こしに 1 行追加するリクエスト。
/// </summary>
/// <param name="Speaker">話者。</param>
/// <param name="Text">発話内容。</param>
public record AppendTranscriptLineRequestDto(string Speaker, string Text);
