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

    /// <summary>
    /// FAQ を更新する。
    /// </summary>
    Task<FaqItemDto?> UpdateFaqAsync(string faqId, UpdateFaqRequestDto request);

    /// <summary>
    /// 転送先を更新する。
    /// </summary>
    Task<TransferDestinationDto?> UpdateTransferDestinationAsync(string destinationId, UpdateTransferDestinationRequestDto request);

    /// <summary>
    /// システム設定を更新する。
    /// </summary>
    Task<SystemSettingsDto> UpdateSystemSettingsAsync(UpdateSystemSettingsRequestDto request);

    /// <summary>
    /// テスト着信を作成する。
    /// </summary>
    Task<CallRecordDto> CreateIncomingCallAsync(CreateTestIncomingCallRequestDto request, string source);

    /// <summary>
    /// 現在着信に操作を反映する。
    /// </summary>
    Task<CallRecordDto> ApplyCurrentCallActionAsync(string action);

    /// <summary>
    /// 現在着信にイベントを反映する。
    /// </summary>
    Task<CallRecordDto> ApplyCurrentCallEventAsync(CallEventUpdateRequestDto request);
}
