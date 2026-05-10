using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shared.Dto;
using Shared.Services;
using WebApp.Controllers;

namespace Tests.Controllers;

public class CallCenterControllerTests
{
    private readonly ICallCenterService _callCenterService;

    public CallCenterControllerTests()
    {
        _callCenterService = Substitute.For<ICallCenterService>();
    }

    [Fact]
    public async Task GetBootstrap_初期表示データを返す()
    {
        var bootstrap = new CallCenterBootstrapDto(
            new CurrentOperatorDto("operator-01", "田中 花子", "オペレーター", "代表電話受付"),
            new SystemSettingsDto("平日 09:00〜18:00", "時間外です。", "お断りします。", true, true, "0.82", "先着応答"),
            new CallRecordDto(
                "CALL-001",
                "03-0000-0000",
                "2026-05-10 10:00",
                string.Empty,
                "オペレーター選択待ち",
                "AI",
                "田中 花子",
                "CUS-001",
                "株式会社青葉商事",
                "法人",
                "既存顧客",
                true,
                false,
                null,
                null,
                null,
                "AI 対応中",
                "未保存",
                [new CallTranscriptLineDto("顧客", "お問い合わせです。", "10:00:10")],
                [new CallEventDto("10:00:01", "着信受付", "ACS", "受付しました")],
                []),
            [],
            [],
            [],
            [],
            [new DashboardStatDto("本日の着信件数", "1件")]);
        _callCenterService.GetBootstrapAsync().Returns(bootstrap);
        var controller = new CallCenterController(_callCenterService);

        var result = await controller.GetBootstrap();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ApiResponseDto<CallCenterBootstrapDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal("田中 花子", response.Data.CurrentOperator.Name);
        Assert.Equal("CALL-001", response.Data.IncomingCall.Id);
    }
}
