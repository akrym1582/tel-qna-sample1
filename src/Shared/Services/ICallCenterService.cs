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

    /// <summary>
    /// FAQ を更新する。
    /// </summary>
    /// <param name="faqId">対象 FAQ ID。</param>
    /// <param name="request">更新内容。</param>
    /// <returns>更新後の FAQ。対象が存在しない場合は <c>null</c>。</returns>
    Task<FaqItemDto?> UpdateFaqAsync(string faqId, UpdateFaqRequestDto request);

    /// <summary>
    /// 転送先を更新する。
    /// </summary>
    /// <param name="destinationId">対象転送先 ID。</param>
    /// <param name="request">更新内容。</param>
    /// <returns>更新後の転送先。対象が存在しない場合は <c>null</c>。</returns>
    Task<TransferDestinationDto?> UpdateTransferDestinationAsync(string destinationId, UpdateTransferDestinationRequestDto request);

    /// <summary>
    /// システム設定を更新する。
    /// </summary>
    /// <param name="request">更新内容。</param>
    /// <returns>更新後のシステム設定。</returns>
    Task<SystemSettingsDto> UpdateSystemSettingsAsync(UpdateSystemSettingsRequestDto request);
}
