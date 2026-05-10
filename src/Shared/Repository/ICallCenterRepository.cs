using Shared.Dto;

namespace Shared.Repository;

/// <summary>
/// 電話受付・AI 応答システムの初期表示データを提供するリポジトリインターフェース。
/// </summary>
public interface ICallCenterRepository
{
    /// <summary>
    /// 画面表示に必要なデータ一式を取得する。
    /// </summary>
    /// <returns>画面初期表示用のデータセット。</returns>
    Task<CallCenterBootstrapDto> GetBootstrapAsync();
}
