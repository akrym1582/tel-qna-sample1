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
    /// <returns>画面初期表示用のデータセット。</returns>
    [HttpGet("bootstrap")]
    public async Task<ActionResult<ApiResponseDto<CallCenterBootstrapDto>>> GetBootstrap()
    {
        var bootstrap = await _callCenterService.GetBootstrapAsync();
        return Ok(new ApiResponseDto<CallCenterBootstrapDto>(true, bootstrap));
    }

    /// <summary>
    /// FAQ を更新する。
    /// </summary>
    /// <param name="faqId">対象 FAQ ID。</param>
    /// <param name="request">更新内容。</param>
    /// <returns>更新後の FAQ。見つからない場合は 404 を返す。</returns>
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
    /// <param name="destinationId">対象転送先 ID。</param>
    /// <param name="request">更新内容。</param>
    /// <returns>更新後の転送先。見つからない場合は 404 を返す。</returns>
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
    /// <param name="request">更新内容。</param>
    /// <returns>更新後のシステム設定。</returns>
    [HttpPut("system-settings")]
    public async Task<ActionResult<ApiResponseDto<SystemSettingsDto>>> UpdateSystemSettings(
        [FromBody] UpdateSystemSettingsRequestDto request)
    {
        var systemSettings = await _callCenterService.UpdateSystemSettingsAsync(request);
        return Ok(new ApiResponseDto<SystemSettingsDto>(true, systemSettings, "システム設定を更新しました。"));
    }
}
