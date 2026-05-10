using NSubstitute;
using Shared.Dto;
using Shared.Repository;
using Shared.Services;

namespace Tests.Services;

public class CallCenterServiceTests
{
    [Fact]
    public async Task AppendCurrentCallTranscriptAsync_音声がある場合は文字起こし結果を優先して保存する()
    {
        var repository = Substitute.For<ICallCenterRepository>();
        var aiCallResponseService = Substitute.For<IAiCallResponseService>();
        var aiTranscriptionService = Substitute.For<IAiTranscriptionService>();
        var recordingStorage = Substitute.For<ICallRecordingStorage>();
        var service = new CallCenterService(repository, aiCallResponseService, aiTranscriptionService, recordingStorage);
        var request = new AppendTranscriptLineRequestDto(
            "顧客",
            "手入力テキスト",
            Convert.ToBase64String("audio"u8.ToArray()),
            "audio/wav",
            "sample.wav");
        var savedCall = CreateCallRecord();
        aiTranscriptionService.TranscribeAsync(Arg.Any<AppendTranscriptLineRequestDto>(), Arg.Any<CancellationToken>())
            .Returns("Foundry 文字起こし結果");
        repository.AppendCurrentCallTranscriptAsync(Arg.Any<AppendTranscriptLineRequestDto>())
            .Returns(savedCall);
        recordingStorage.SaveAsync(savedCall).Returns(savedCall.RecordingLocation);

        await service.AppendCurrentCallTranscriptAsync(request);

        await repository.Received(1).AppendCurrentCallTranscriptAsync(
            Arg.Is<AppendTranscriptLineRequestDto>(transcriptRequest =>
                transcriptRequest.Text == "Foundry 文字起こし結果" &&
                transcriptRequest.Speaker == "顧客"));
    }

    private static CallRecordDto CreateCallRecord() =>
        new(
            "CALL-001",
            "03-0000-0000",
            "2026-05-10 10:00",
            string.Empty,
            "オペレーター選択待ち",
            "AI",
            "代表電話受付",
            "CUS-001",
            "株式会社青葉商事",
            "法人",
            "既存顧客",
            false,
            false,
            null,
            null,
            null,
            "要約待ち",
            "recordings/CALL-001.json",
            [],
            [],
            []);
}
