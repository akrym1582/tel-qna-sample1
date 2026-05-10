namespace Shared.Dto;

/// <summary>
/// 現在着信の文字起こしに 1 行追加するリクエスト。
/// </summary>
/// <param name="Speaker">話者。</param>
/// <param name="Text">発話内容。</param>
/// <param name="AudioBase64">Azure AI Foundry で文字起こしする音声データ (Base64)。</param>
/// <param name="AudioMimeType">音声データの MIME タイプ。</param>
/// <param name="AudioFileName">音声ファイル名。</param>
public record AppendTranscriptLineRequestDto(
    string Speaker,
    string Text,
    string? AudioBase64 = null,
    string? AudioMimeType = null,
    string? AudioFileName = null);
