using Shared.Dto;

namespace Shared.Services;

/// <summary>
/// 電話受付・AI 応答システムの画面表示データを提供するサービスインターフェース。
/// </summary>
public interface ICallCenterService
{
    /// <summary>
    /// 画面初期表示に必要なデータ一式を取得する。
    /// </summary>
    /// <returns>画面初期表示用のデータセット。</returns>
    Task<CallCenterBootstrapDto> GetBootstrapAsync();
}
