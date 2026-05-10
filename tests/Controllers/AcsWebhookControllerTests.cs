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
}
