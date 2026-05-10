using Shared.Dto;

namespace Shared.Services;

/// <summary>
/// 現在着信向けの AI 応答を生成するサービス。
/// </summary>
public interface IAiCallResponseService
{
    /// <summary>
    /// AI 応答と要約を生成する。
    /// </summary>
    Task<AiCallResponseDto> GenerateResponseAsync(CallCenterBootstrapDto bootstrap, CancellationToken cancellationToken = default);
}
