using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Dto;
using Shared.Services;

namespace WebApp.Controllers;

/// <summary>
/// 電話受付・AI 応答システムの画面表示に必要な API を提供するコントローラー。
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CallCenterController : ControllerBase
{
    private readonly ICallCenterService _callCenterService;

    /// <summary>
    /// <see cref="CallCenterController"/> の新しいインスタンスを初期化する。
    /// </summary>
    /// <param name="callCenterService">電話受付画面用サービス。</param>
    public CallCenterController(ICallCenterService callCenterService)
    {
        _callCenterService = callCenterService;
    }

    /// <summary>
    /// 初期フェーズの画面表示に必要なデータ一式を取得する。
    /// </summary>
    [HttpGet("bootstrap")]
    public async Task<ActionResult<ApiResponseDto<CallCenterBootstrapDto>>> GetBootstrap()
    {
        var bootstrap = await _callCenterService.GetBootstrapAsync();
        return Ok(new ApiResponseDto<CallCenterBootstrapDto>(true, bootstrap));
    }

    /// <summary>
    /// FAQ を更新する。
    /// </summary>
    [HttpPut("faqs/{faqId}")]
    public async Task<ActionResult<ApiResponseDto<FaqItemDto>>> UpdateFaq(
        string faqId,
        [FromBody] UpdateFaqRequestDto request)
    {
        var faq = await _callCenterService.UpdateFaqAsync(faqId, request);
        if (faq is null)
        {
            return NotFound(new ApiResponseDto(false, "FAQ が見つかりません。"));
        }

        return Ok(new ApiResponseDto<FaqItemDto>(true, faq, "FAQ を更新しました。"));
    }

    /// <summary>
    /// 転送先を更新する。
    /// </summary>
    [HttpPut("transfer-destinations/{destinationId}")]
    public async Task<ActionResult<ApiResponseDto<TransferDestinationDto>>> UpdateTransferDestination(
        string destinationId,
        [FromBody] UpdateTransferDestinationRequestDto request)
    {
        var destination = await _callCenterService.UpdateTransferDestinationAsync(destinationId, request);
        if (destination is null)
        {
            return NotFound(new ApiResponseDto(false, "転送先が見つかりません。"));
        }

        return Ok(new ApiResponseDto<TransferDestinationDto>(true, destination, "転送先を更新しました。"));
    }

    /// <summary>
    /// システム設定を更新する。
    /// </summary>
    [HttpPut("system-settings")]
    public async Task<ActionResult<ApiResponseDto<SystemSettingsDto>>> UpdateSystemSettings(
        [FromBody] UpdateSystemSettingsRequestDto request)
    {
        var systemSettings = await _callCenterService.UpdateSystemSettingsAsync(request);
        return Ok(new ApiResponseDto<SystemSettingsDto>(true, systemSettings, "システム設定を更新しました。"));
    }

    /// <summary>
    /// テスト着信を作成する。
    /// </summary>
    [HttpPost("test-calls")]
    public async Task<ActionResult<ApiResponseDto<CallRecordDto>>> CreateTestIncomingCall(
        [FromBody] CreateTestIncomingCallRequestDto request)
    {
        var call = await _callCenterService.CreateIncomingCallAsync(request, "テスト着信");
        return Ok(new ApiResponseDto<CallRecordDto>(true, call, "テスト着信を作成しました。"));
    }

    /// <summary>
    /// 現在着信に操作を反映する。
    /// </summary>
    [HttpPut("current-call/actions/{action}")]
    public async Task<ActionResult<ApiResponseDto<CallRecordDto>>> ApplyCurrentCallAction(string action)
    {
        try
        {
            var call = await _callCenterService.ApplyCurrentCallActionAsync(action);
            return Ok(new ApiResponseDto<CallRecordDto>(true, call, "通話状態を更新しました。"));
        }
        catch (ArgumentException)
        {
            return BadRequest(new ApiResponseDto(false, "未対応の通話操作です。"));
        }
    }

    /// <summary>
    /// 現在着信の文字起こしに発話を追加する。
    /// </summary>
    [HttpPost("current-call/transcript")]
    public async Task<ActionResult<ApiResponseDto<CallRecordDto>>> AppendCurrentCallTranscript(
        [FromBody] AppendTranscriptLineRequestDto request)
    {
        var call = await _callCenterService.AppendCurrentCallTranscriptAsync(request);
        return Ok(new ApiResponseDto<CallRecordDto>(true, call, "文字起こしを更新しました。"));
    }

    /// <summary>
    /// 現在着信に対する AI 応答を生成する。
    /// </summary>
    [HttpPost("current-call/ai-response")]
    public async Task<ActionResult<ApiResponseDto<CallRecordDto>>> GenerateAiResponse()
    {
        var call = await _callCenterService.GenerateAiResponseAsync();
        return Ok(new ApiResponseDto<CallRecordDto>(true, call, "AI 応答を生成しました。"));
    }
}
