using Shared.Dto;
using Shared.Repository;

namespace Shared.Services;

/// <summary>
/// 電話受付・AI 応答システム向けの表示データを提供するサービス実装。
/// </summary>
public class CallCenterService : ICallCenterService
{
    private readonly ICallCenterRepository _repository;

    /// <summary>
    /// <see cref="CallCenterService"/> の新しいインスタンスを初期化する。
    /// </summary>
    /// <param name="repository">電話受付データリポジトリ。</param>
    public CallCenterService(ICallCenterRepository repository)
    {
        _repository = repository;
    }

    /// <inheritdoc/>
    public async Task<CallCenterBootstrapDto> GetBootstrapAsync() =>
        await _repository.GetBootstrapAsync();
}
