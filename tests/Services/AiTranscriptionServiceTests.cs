using System.Net;
using System.Net.Http;
using System.Text;
using Shared.Dto;
using Shared.Services;
using Shared.Util;

namespace Tests.Services;

public class AiTranscriptionServiceTests
{
    [Fact]
    public async Task TranscribeAsync_設定済みかつ成功時は文字起こし結果を返す()
    {
        var handler = new StubHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("""{"text":"  保守担当につないでください。  "}""", Encoding.UTF8, "application/json"),
            });
        var httpClient = new HttpClient(handler);
        var service = new AiTranscriptionService(
            httpClient,
            new AiFoundrySettings
            {
                Endpoint = "https://example.openai.azure.com",
                ApiKey = "test-key",
                TranscriptionDeployment = "gpt-4o-mini-transcribe",
                UseMockWhenUnavailable = true,
            });

        var result = await service.TranscribeAsync(
            new AppendTranscriptLineRequestDto(
                "顧客",
                string.Empty,
                Convert.ToBase64String(Encoding.UTF8.GetBytes("audio")),
                "audio/wav",
                "sample.wav"));

        Assert.Equal("保守担当につないでください。", result);
    }

    [Fact]
    public async Task TranscribeAsync_未設定時はNullを返す()
    {
        var handler = new StubHttpMessageHandler(_ => throw new InvalidOperationException("未使用"));
        var httpClient = new HttpClient(handler);
        var service = new AiTranscriptionService(httpClient, new AiFoundrySettings());

        var result = await service.TranscribeAsync(
            new AppendTranscriptLineRequestDto(
                "顧客",
                string.Empty,
                Convert.ToBase64String(Encoding.UTF8.GetBytes("audio")),
                "audio/wav",
                "sample.wav"));

        Assert.Null(result);
    }

    private sealed class StubHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _handle;

        public StubHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> handle)
        {
            _handle = handle;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(_handle(request));
    }
}
