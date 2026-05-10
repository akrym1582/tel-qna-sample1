using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shared.Dto;
using Shared.Services;
using WebApp.Controllers;

namespace Tests.Controllers;

public class AcsWebhookControllerTests
{
    private readonly ICallCenterService _callCenterService;

    public AcsWebhookControllerTests()
    {
        _callCenterService = Substitute.For<ICallCenterService>();
    }

    [Fact]
    public async Task HandleEvents_ValidationEvent_ValidationResponseを返す()
    {
        var controller = new AcsWebhookController(_callCenterService);
        using var document = JsonDocument.Parse(
            """
            [
              {
                "eventType": "Microsoft.EventGrid.SubscriptionValidationEvent",
                "data": { "validationCode": "abc123" }
              }
            ]
            """);

        var result = await controller.HandleEvents(document.RootElement);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(okResult.Value);
        Assert.Contains("abc123", json, StringComparison.Ordinal);
    }

    [Fact]
    public async Task HandleEvents_IncomingCall_着信作成を呼び出す()
    {
        _callCenterService.CreateIncomingCallAsync(Arg.Any<CreateTestIncomingCallRequestDto>(), "ACS")
            .Returns(new CallRecordDto(
                "CALL-001",
                "+81300000000",
                "2026-05-10 10:00",
                string.Empty,
                "オペレーター選択待ち",
                "AI",
                "代表電話受付",
                "CUS-0000",
                "ACS Caller",
                "不明",
                "ACS webhook から取り込んだ着信です。",
                false,
                false,
                null,
                null,
                null,
                "着信を受け付けました。",
                "未保存",
                [],
                [],
                []));
        var controller = new AcsWebhookController(_callCenterService);
        using var document = JsonDocument.Parse(
            """
            [
              {
                "eventType": "Microsoft.Communication.IncomingCall",
                "data": {
                  "from": { "rawId": "+81300000000" },
                  "callerDisplayName": "ACS Caller",
                  "customContext": {
                    "voipHeaders": {
                      "x-topic": "見積もりを相談したいです。"
                    }
                  }
                }
              }
            ]
            """);

        var result = await controller.HandleEvents(document.RootElement);

        Assert.IsType<OkObjectResult>(result);
        await _callCenterService.Received(1).CreateIncomingCallAsync(
            Arg.Is<CreateTestIncomingCallRequestDto>(request =>
                request.CallerNumber == "+81300000000" && request.RequestedTopic == "見積もりを相談したいです。"),
            "ACS");
    }

    [Fact]
    public async Task HandleCallbacks_CallConnected_固定ガイダンス開始イベントを反映する()
    {
        var controller = new AcsWebhookController(_callCenterService);
        using var document = JsonDocument.Parse(
            """
            {
              "type": "Microsoft.Communication.CallConnected",
              "data": {
                "callConnectionId": "conn-001"
              }
            }
            """);

        var result = await controller.HandleCallbacks(document.RootElement);

        Assert.IsType<OkObjectResult>(result);
        await _callCenterService.Received(1).ApplyCurrentCallEventAsync(
            Arg.Is<CallEventUpdateRequestDto>(request =>
                request.EventType == "通話接続" &&
                request.Status == "着信受付中" &&
                request.AiSummary!.Contains("固定ガイダンス", StringComparison.Ordinal)));
    }

    [Fact]
    public async Task HandleCallbacks_MediaStreamingStarted_AI応答開始を反映する()
    {
        var controller = new AcsWebhookController(_callCenterService);
        using var document = JsonDocument.Parse(
            """
            [
              {
                "eventType": "Microsoft.Communication.MediaStreamingStarted",
                "data": {
                  "callConnectionId": "conn-001"
                }
              }
            ]
            """);

        var result = await controller.HandleCallbacks(document.RootElement);

        Assert.IsType<OkObjectResult>(result);
        await _callCenterService.Received(1).ApplyCurrentCallEventAsync(
            Arg.Is<CallEventUpdateRequestDto>(request =>
                request.EventType == "メディアストリーミング開始" &&
                request.Status == "AI対応中" &&
                request.ResponseMode == "AI"));
    }

    [Fact]
    public async Task HandleCallbacks_TranscriptionUpdated_文字起こし追加を呼び出す()
    {
        _callCenterService.AppendCurrentCallTranscriptAsync(Arg.Any<AppendTranscriptLineRequestDto>())
            .Returns(new CallRecordDto(
                "CALL-001",
                "+81300000000",
                "2026-05-10 10:00",
                string.Empty,
                "AI対応中",
                "AI",
                "代表電話受付",
                "CUS-0000",
                "ACS Caller",
                "不明",
                "ACS webhook から取り込んだ着信です。",
                true,
                false,
                null,
                null,
                null,
                "AI 応答中です。",
                "未保存",
                [],
                [],
                []));
        var controller = new AcsWebhookController(_callCenterService);
        using var document = JsonDocument.Parse(
            """
            {
              "eventType": "Microsoft.Communication.TranscriptionUpdated",
              "data": {
                "result": {
                  "participantId": "8:acs:customer",
                  "text": "サポートにつないでください。"
                }
              }
            }
            """);

        var result = await controller.HandleCallbacks(document.RootElement);

        Assert.IsType<OkObjectResult>(result);
        await _callCenterService.Received(1).AppendCurrentCallTranscriptAsync(
            Arg.Is<AppendTranscriptLineRequestDto>(request =>
                request.Speaker == "顧客" &&
                request.Text == "サポートにつないでください。"));
    }

    [Fact]
    public async Task HandleCallbacks_CallDisconnected_録音保存先と終了時刻を反映する()
    {
        var controller = new AcsWebhookController(_callCenterService);
        using var document = JsonDocument.Parse(
            """
            {
              "eventType": "Microsoft.Communication.CallDisconnected",
              "eventTime": "2026-05-10T10:15:30Z",
              "data": {
                "recordingLocation": "https://storage.example/call.json"
              }
            }
            """);

        var result = await controller.HandleCallbacks(document.RootElement);

        Assert.IsType<OkObjectResult>(result);
        await _callCenterService.Received(1).ApplyCurrentCallEventAsync(
            Arg.Is<CallEventUpdateRequestDto>(request =>
                request.EventType == "通話終了" &&
                request.Status == "通話終了" &&
                request.RecordingLocation == "https://storage.example/call.json" &&
                request.EndedAt == "2026-05-10 10:15"));
    }
}
