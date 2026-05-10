using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Dto;
using Shared.Services;

namespace WebApp.Controllers;

/// <summary>
/// ACS / Event Grid 互換 webhook を受け付けるコントローラー。
/// </summary>
[ApiController]
[Route("api/acs")]
[AllowAnonymous]
public class AcsWebhookController : ControllerBase
{
    private readonly ICallCenterService _callCenterService;

    /// <summary>
    /// <see cref="AcsWebhookController"/> の新しいインスタンスを初期化する。
    /// </summary>
    /// <param name="callCenterService">電話受付画面用サービス。</param>
    public AcsWebhookController(ICallCenterService callCenterService)
    {
        _callCenterService = callCenterService;
    }

    /// <summary>
    /// Event Grid 互換イベントを処理する。
    /// </summary>
    [HttpPost("events")]
    public async Task<IActionResult> HandleEvents([FromBody] JsonElement payload)
    {
        if (payload.ValueKind != JsonValueKind.Array)
        {
            return BadRequest(new ApiResponseDto(false, "イベント配列を送信してください。"));
        }

        foreach (var eventItem in payload.EnumerateArray())
        {
            var eventType = GetPropertyString(eventItem, "eventType");
            if (string.Equals(eventType, "Microsoft.EventGrid.SubscriptionValidationEvent", StringComparison.Ordinal))
            {
                var validationCode = GetNestedPropertyString(eventItem, "data", "validationCode");
                return Ok(new { validationResponse = validationCode });
            }

            if (string.Equals(eventType, "Microsoft.Communication.IncomingCall", StringComparison.Ordinal))
            {
                var callerNumber = GetNestedPropertyString(eventItem, "data", "from", "rawId")
                    ?? GetNestedPropertyString(eventItem, "data", "from", "phoneNumber", "value")
                    ?? "匿名";
                var callerDisplayName = GetNestedPropertyString(eventItem, "data", "callerDisplayName") ?? callerNumber;
                var topic = GetNestedPropertyString(eventItem, "data", "customContext", "voipHeaders", "x-topic")
                    ?? "ACS からの着信を受信しました。";
                await _callCenterService.CreateIncomingCallAsync(
                    new CreateTestIncomingCallRequestDto(
                        callerNumber,
                        callerDisplayName,
                        "不明",
                        "ACS webhook から取り込んだ着信です。",
                        topic),
                    "ACS");
                continue;
            }

            if (string.Equals(eventType, "Microsoft.Communication.CallConnected", StringComparison.Ordinal))
            {
                await _callCenterService.ApplyCurrentCallEventAsync(
                    new CallEventUpdateRequestDto(
                        "通話接続",
                        "ACS",
                        "ACS から通話接続イベントを受信しました。",
                        "着信受付中",
                        "人間",
                        "オペレーター接続済みです。",
                        null,
                        null));
                continue;
            }

            if (string.Equals(eventType, "Microsoft.Communication.CallEnded", StringComparison.Ordinal))
            {
                await _callCenterService.ApplyCurrentCallEventAsync(
                    new CallEventUpdateRequestDto(
                        "通話終了",
                        "ACS",
                        "ACS から通話終了イベントを受信しました。",
                        "通話終了",
                        null,
                        "通話が終了しました。",
                        GetNestedPropertyString(eventItem, "data", "recordingLocation"),
                        DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")));
            }
        }

        return Ok(new ApiResponseDto(true, "ACS イベントを処理しました。"));
    }

    private static string? GetPropertyString(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var value))
        {
            return null;
        }

        return value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString();
    }

    private static string? GetNestedPropertyString(JsonElement element, params string[] propertyPath)
    {
        var current = element;
        foreach (var propertyName in propertyPath)
        {
            if (!current.TryGetProperty(propertyName, out current))
            {
                return null;
            }
        }

        return current.ValueKind == JsonValueKind.String ? current.GetString() : current.ToString();
    }
}
