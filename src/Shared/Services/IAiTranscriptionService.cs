using Shared.Dto;

namespace Shared.Services;

/// <summary>
/// Azure AI Foundry を利用して音声から文字起こしを生成する。
/// </summary>
public interface IAiTranscriptionService
{
    /// <summary>
    /// 音声入力から文字起こしを生成する。
    /// </summary>
    /// <param name="request">文字起こし追記リクエスト。</param>
    /// <param name="cancellationToken">キャンセル トークン。</param>
    /// <returns>生成された文字起こし。生成できない場合は <see langword="null"/>。</returns>
    Task<string?> TranscribeAsync(AppendTranscriptLineRequestDto request, CancellationToken cancellationToken = default);
}
