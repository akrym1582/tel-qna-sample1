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
    /// 現在着信の文字起こしに発話を追加する。
    /// </summary>
    Task<CallRecordDto> AppendCurrentCallTranscriptAsync(AppendTranscriptLineRequestDto request);

    /// <summary>
    /// 現在着信に対する AI 応答を生成する。
    /// </summary>
    Task<CallRecordDto> GenerateAiResponseAsync();

    /// <summary>
    /// 現在着信にイベントを反映する。
    /// </summary>
    Task<CallRecordDto> ApplyCurrentCallEventAsync(CallEventUpdateRequestDto request);
}
