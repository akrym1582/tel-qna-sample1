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
        var bootstrap = CreateBootstrap();
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

    [Fact]
    public async Task UpdateFaq_対象が存在する場合は更新済みFAQを返す()
    {
        var updatedFaq = new FaqItemDto(
            "FAQ-001",
            "更新後の質問",
            "更新後の回答",
            "ログイン",
            ["再送", "メール未着"],
            true,
            "2026-05-10 12:00",
            "管理者",
            "0.91");
        _callCenterService.UpdateFaqAsync("FAQ-001", Arg.Any<UpdateFaqRequestDto>()).Returns(updatedFaq);
        var controller = new CallCenterController(_callCenterService);

        var result = await controller.UpdateFaq(
            "FAQ-001",
            new UpdateFaqRequestDto("更新後の質問", "更新後の回答", "ログイン", ["再送", "メール未着"], true, "0.91"));

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ApiResponseDto<FaqItemDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal("更新後の質問", response.Data?.Question);
    }

    [Fact]
    public async Task UpdateTransferDestination_対象が存在しない場合はNotFoundを返す()
    {
        _callCenterService.UpdateTransferDestinationAsync("TR-999", Arg.Any<UpdateTransferDestinationRequestDto>())
            .Returns((TransferDestinationDto?)null);
        var controller = new CallCenterController(_callCenterService);

        var result = await controller.UpdateTransferDestination(
            "TR-999",
            new UpdateTransferDestinationRequestDto("名称", "種別", "部署", "03-0000-0000", "平日", 1, "ヒント", "代替", true));

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        var response = Assert.IsType<ApiResponseDto>(notFoundResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task UpdateSystemSettings_更新済み設定を返す()
    {
        var updatedSettings = new SystemSettingsDto(
            "平日 08:00〜17:00",
            "時間外メッセージ",
            "お断りメッセージ",
            false,
            false,
            "0.90",
            "AI 優先");
        _callCenterService.UpdateSystemSettingsAsync(Arg.Any<UpdateSystemSettingsRequestDto>()).Returns(updatedSettings);
        var controller = new CallCenterController(_callCenterService);

        var result = await controller.UpdateSystemSettings(
            new UpdateSystemSettingsRequestDto(
                "平日 08:00〜17:00",
                "時間外メッセージ",
                "お断りメッセージ",
                false,
                false,
                "0.90",
                "AI 優先"));

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ApiResponseDto<SystemSettingsDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal("平日 08:00〜17:00", response.Data?.BusinessHours);
        Assert.False(response.Data?.AiEnabled);
    }

    [Fact]
    public async Task CreateTestIncomingCall_作成済み着信を返す()
    {
        var createdCall = CreateIncomingCall();
        _callCenterService.CreateIncomingCallAsync(Arg.Any<CreateTestIncomingCallRequestDto>(), "テスト着信")
            .Returns(createdCall);
        var controller = new CallCenterController(_callCenterService);

        var result = await controller.CreateTestIncomingCall(
            new CreateTestIncomingCallRequestDto("03-4000-9999", "テスト顧客", "テスト", "要約", "相談したいです。"));

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ApiResponseDto<CallRecordDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(createdCall.Id, response.Data?.Id);
    }

    [Fact]
    public async Task ApplyCurrentCallAction_未対応操作の場合はBadRequestを返す()
    {
        _callCenterService.ApplyCurrentCallActionAsync("unknown")
            .Returns(Task.FromException<CallRecordDto>(new ArgumentException("未対応の通話操作です。")));
        var controller = new CallCenterController(_callCenterService);

        var result = await controller.ApplyCurrentCallAction("unknown");

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<ApiResponseDto>(badRequestResult.Value);
        Assert.False(response.Success);
    }

    private static CallCenterBootstrapDto CreateBootstrap() =>
        new(
            new CurrentOperatorDto("operator-01", "田中 花子", "オペレーター", "代表電話受付"),
            new SystemSettingsDto("平日 09:00〜18:00", "時間外です。", "お断りします。", true, true, "0.82", "先着応答"),
            CreateIncomingCall(),
            [],
            [],
            [],
            [],
            [new DashboardStatDto("本日の着信件数", "1件")]);

    private static CallRecordDto CreateIncomingCall() =>
        new(
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
            []);
}
