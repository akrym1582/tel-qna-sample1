using System.Globalization;
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
    private const string IncomingCallEvent = "Microsoft.Communication.IncomingCall";
    private const string IncomingCallReceivedEvent = "Microsoft.Communication.IncomingCallReceived";
    private const string SubscriptionValidationEvent = "Microsoft.EventGrid.SubscriptionValidationEvent";
    private const string CallConnectedEvent = "Microsoft.Communication.CallConnected";
    private const string CallDisconnectedEvent = "Microsoft.Communication.CallDisconnected";
    private const string CallEndedEvent = "Microsoft.Communication.CallEnded";
    private const string PlayCompletedEvent = "Microsoft.Communication.PlayCompleted";
    private const string PlayFailedEvent = "Microsoft.Communication.PlayFailed";
    private const string MediaStreamingStartedEvent = "Microsoft.Communication.MediaStreamingStarted";
    private const string MediaStreamingStoppedEvent = "Microsoft.Communication.MediaStreamingStopped";
    private const string MediaStreamingFailedEvent = "Microsoft.Communication.MediaStreamingFailed";
    private const string RecordingFileStatusUpdatedEvent = "Microsoft.Communication.RecordingFileStatusUpdated";
    private const string TranscriptionUpdatedEvent = "Microsoft.Communication.TranscriptionUpdated";
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
            var eventType = GetEventType(eventItem);
            if (string.Equals(eventType, SubscriptionValidationEvent, StringComparison.Ordinal))
            {
                var validationCode = GetNestedPropertyString(eventItem, "data", "validationCode");
                return Ok(new { validationResponse = validationCode });
            }

            if (string.Equals(eventType, IncomingCallEvent, StringComparison.Ordinal) ||
                string.Equals(eventType, IncomingCallReceivedEvent, StringComparison.Ordinal))
            {
                await HandleIncomingCallEventAsync(eventItem);
            }
        }

        return Ok(new ApiResponseDto(true, "ACS イベントを処理しました。"));
    }

    /// <summary>
    /// Call Automation コールバックイベントを処理する。
    /// </summary>
    [HttpPost("callbacks")]
    public async Task<IActionResult> HandleCallbacks([FromBody] JsonElement payload)
    {
        if (payload.ValueKind is not JsonValueKind.Array and not JsonValueKind.Object)
        {
            return BadRequest(new ApiResponseDto(false, "イベント配列またはイベント オブジェクトを送信してください。"));
        }

        if (payload.ValueKind == JsonValueKind.Array)
        {
            foreach (var eventItem in payload.EnumerateArray())
            {
                await HandleCallbackEventAsync(eventItem);
            }
        }
        else
        {
            await HandleCallbackEventAsync(payload);
        }

        return Ok(new ApiResponseDto(true, "ACS コールバックを処理しました。"));
    }

    private static string GetEventType(JsonElement element) =>
        GetPropertyString(element, "type") ??
        GetPropertyString(element, "eventType") ??
        string.Empty;

    private static string BuildFailureDetail(string message, JsonElement eventItem)
    {
        var resultInformation = GetNestedPropertyString(eventItem, "data", "resultInformation", "message") ??
            GetNestedPropertyString(eventItem, "data", "resultInformation", "subCode") ??
            GetNestedPropertyString(eventItem, "data", "resultInformation") ??
            GetNestedPropertyString(eventItem, "data", "error", "message");
        return string.IsNullOrWhiteSpace(resultInformation) ? message : $"{message} {resultInformation}";
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
        if (!TryGetNestedProperty(element, out var current, propertyPath))
        {
            return null;
        }

        return current.ValueKind == JsonValueKind.String ? current.GetString() : current.ToString();
    }

    private static bool TryGetNestedProperty(JsonElement element, out JsonElement current, params string[] propertyPath)
    {
        current = element;
        foreach (var propertyName in propertyPath)
        {
            if (!current.TryGetProperty(propertyName, out current))
            {
                current = default;
                return false;
            }
        }

        return true;
    }

    private static string? NormalizeTimestamp(string? rawTimestamp)
    {
        if (string.IsNullOrWhiteSpace(rawTimestamp))
        {
            return null;
        }

        return DateTime.TryParse(rawTimestamp, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var timestamp)
            ? timestamp.ToString("yyyy-MM-dd HH:mm")
            : rawTimestamp;
    }

    private async Task HandleIncomingCallEventAsync(JsonElement eventItem)
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
    }

    private async Task HandleCallbackEventAsync(JsonElement eventItem)
    {
        var eventType = GetEventType(eventItem);
        switch (eventType)
        {
            case CallConnectedEvent:
                await _callCenterService.ApplyCurrentCallEventAsync(
                    new CallEventUpdateRequestDto(
                        "通話接続",
                        "ACS",
                        "通話接続が完了しました。固定ガイダンスの再生と Realtime API の事前初期化を開始します。",
                        "着信受付中",
                        null,
                        "接続直後の待ち時間を隠すため、固定ガイダンスを再生しながら AI 音声応答の準備を進めています。",
                        null,
                        null));
                break;
            case PlayCompletedEvent:
                await _callCenterService.ApplyCurrentCallEventAsync(
                    new CallEventUpdateRequestDto(
                        "固定ガイダンス再生完了",
                        "ACS",
                        "固定音声案内が完了しました。メディアストリーミングを開始します。",
                        "着信受付中",
                        null,
                        "固定ガイダンス完了後に Realtime API との音声対話へ移行します。",
                        null,
                        null));
                break;
            case PlayFailedEvent:
                await _callCenterService.ApplyCurrentCallEventAsync(
                    new CallEventUpdateRequestDto(
                        "固定ガイダンス再生失敗",
                        "ACS",
                        BuildFailureDetail("固定音声案内の再生に失敗しました。", eventItem),
                        "着信受付中",
                        null,
                        "固定ガイダンスは失敗しましたが、AI 音声応答へ移行できるか継続確認してください。",
                        null,
                        null));
                break;
            case MediaStreamingStartedEvent:
                await _callCenterService.ApplyCurrentCallEventAsync(
                    new CallEventUpdateRequestDto(
                        "メディアストリーミング開始",
                        "ACS",
                        "双方向メディア ストリーミングを開始しました。Realtime API との音声対話を継続できます。",
                        "AI対応中",
                        "AI",
                        "Realtime API との音声対話を開始しました。",
                        null,
                        null));
                break;
            case MediaStreamingStoppedEvent:
                await _callCenterService.ApplyCurrentCallEventAsync(
                    new CallEventUpdateRequestDto(
                        "メディアストリーミング停止",
                        "ACS",
                        "メディアストリーミングが停止しました。",
                        null,
                        null,
                        null,
                        null,
                        null));
                break;
            case MediaStreamingFailedEvent:
                await _callCenterService.ApplyCurrentCallEventAsync(
                    new CallEventUpdateRequestDto(
                        "メディアストリーミング失敗",
                        "ACS",
                        BuildFailureDetail("メディアストリーミングの開始に失敗しました。", eventItem),
                        "着信受付中",
                        "人間",
                        "AI 音声対話に失敗したため、人手対応への切り替えが必要です。",
                        null,
                        null));
                break;
            case RecordingFileStatusUpdatedEvent:
                await _callCenterService.ApplyCurrentCallEventAsync(
                    new CallEventUpdateRequestDto(
                        "録音ファイル更新",
                        "ACS",
                        "録音ファイルの保存先が更新されました。",
                        null,
                        null,
                        null,
                        GetRecordingLocation(eventItem),
                        null));
                break;
            case TranscriptionUpdatedEvent:
                await AppendTranscriptFromCallbackAsync(eventItem);
                break;
            case CallDisconnectedEvent:
            case CallEndedEvent:
                await _callCenterService.ApplyCurrentCallEventAsync(
                    new CallEventUpdateRequestDto(
                        "通話終了",
                        "ACS",
                        "ACS から通話終了イベントを受信しました。",
                        "通話終了",
                        null,
                        "通話が終了しました。",
                        GetRecordingLocation(eventItem),
                        GetEventTimestamp(eventItem) ?? DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")));
                break;
        }
    }

    private async Task AppendTranscriptFromCallbackAsync(JsonElement eventItem)
    {
        var transcriptText = GetTranscriptionText(eventItem);
        if (string.IsNullOrWhiteSpace(transcriptText))
        {
            return;
        }

        await _callCenterService.AppendCurrentCallTranscriptAsync(
            new AppendTranscriptLineRequestDto(
                GetTranscriptSpeaker(eventItem),
                transcriptText));
    }

    private string? GetRecordingLocation(JsonElement eventItem)
    {
        var directLocation = GetNestedPropertyString(eventItem, "data", "recordingLocation") ??
            GetNestedPropertyString(eventItem, "data", "contentLocation");
        if (!string.IsNullOrWhiteSpace(directLocation))
        {
            return directLocation;
        }

        if (TryGetNestedProperty(eventItem, out var chunksElement, "data", "recordingStorageInfo", "recordingChunks") &&
            chunksElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var chunk in chunksElement.EnumerateArray())
            {
                var chunkLocation = GetPropertyString(chunk, "contentLocation");
                if (!string.IsNullOrWhiteSpace(chunkLocation))
                {
                    return chunkLocation;
                }
            }
        }

        return null;
    }

    private string? GetEventTimestamp(JsonElement eventItem) =>
        NormalizeTimestamp(
            GetPropertyString(eventItem, "eventTime") ??
            GetPropertyString(eventItem, "time"));

    private string? GetTranscriptionText(JsonElement eventItem) =>
        GetNestedPropertyString(eventItem, "data", "result", "text") ??
        GetNestedPropertyString(eventItem, "data", "recognizedText") ??
        GetNestedPropertyString(eventItem, "data", "displayText");

    private string GetTranscriptSpeaker(JsonElement eventItem)
    {
        var speaker = GetNestedPropertyString(eventItem, "data", "result", "participantId") ??
            GetNestedPropertyString(eventItem, "data", "result", "speaker") ??
            GetNestedPropertyString(eventItem, "data", "participantId");
        return !string.IsNullOrWhiteSpace(speaker) && speaker.Contains("agent", StringComparison.OrdinalIgnoreCase)
            ? "オペレーター"
            : "顧客";
    }
}
