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
}
