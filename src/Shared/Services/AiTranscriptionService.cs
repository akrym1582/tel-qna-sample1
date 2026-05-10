using System.Net.Http.Headers;
using System.Text.Json;
using Shared.Dto;
using Shared.Util;

namespace Shared.Services;

/// <summary>
/// Azure AI Foundry の音声文字起こし API を呼び出すサービス。
/// </summary>
public class AiTranscriptionService : IAiTranscriptionService
{
    private readonly HttpClient _httpClient;
    private readonly AiFoundrySettings _settings;

    /// <summary>
    /// <see cref="AiTranscriptionService"/> の新しいインスタンスを初期化する。
    /// </summary>
    /// <param name="httpClient">HTTP クライアント。</param>
    /// <param name="settings">Azure AI Foundry 接続設定。</param>
    public AiTranscriptionService(HttpClient httpClient, AiFoundrySettings settings)
    {
        _httpClient = httpClient;
        _settings = settings;
    }

    /// <inheritdoc/>
    public async Task<string?> TranscribeAsync(
        AppendTranscriptLineRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.AudioBase64) || !IsConfigured())
        {
            return null;
        }

        try
        {
            var audioBytes = Convert.FromBase64String(request.AudioBase64);
            if (audioBytes.Length == 0)
            {
                return null;
            }

            using var multipart = new MultipartFormDataContent();
            using var audioContent = new ByteArrayContent(audioBytes);
            var mimeType = string.IsNullOrWhiteSpace(request.AudioMimeType)
                ? "audio/wav"
                : request.AudioMimeType.Trim();
            audioContent.Headers.ContentType = MediaTypeHeaderValue.Parse(mimeType);
            multipart.Add(audioContent, "file", BuildAudioFileName(request.AudioFileName, mimeType));
            multipart.Add(new StringContent(_settings.TranscriptionDeployment), "model");

            using var message = new HttpRequestMessage(HttpMethod.Post, BuildTranscriptionUri())
            {
                Content = multipart,
            };
            message.Headers.Add("api-key", _settings.ApiKey);
            using var response = await _httpClient.SendAsync(message, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(responseStream, cancellationToken: cancellationToken);
            if (!document.RootElement.TryGetProperty("text", out var textElement))
            {
                return null;
            }

            var transcriptText = textElement.GetString();
            return string.IsNullOrWhiteSpace(transcriptText) ? null : transcriptText.Trim();
        }
        catch when (_settings.UseMockWhenUnavailable)
        {
            return null;
        }
    }

    private bool IsConfigured() =>
        !string.IsNullOrWhiteSpace(_settings.Endpoint) &&
        !string.IsNullOrWhiteSpace(_settings.ApiKey) &&
        !string.IsNullOrWhiteSpace(_settings.TranscriptionDeployment);

    private Uri BuildTranscriptionUri()
    {
        var endpoint = _settings.Endpoint.TrimEnd('/');
        var apiVersion = Uri.EscapeDataString(_settings.ApiVersion);
        var deployment = Uri.EscapeDataString(_settings.TranscriptionDeployment);
        return new Uri($"{endpoint}/openai/deployments/{deployment}/audio/transcriptions?api-version={apiVersion}");
    }

    private string BuildAudioFileName(string? audioFileName, string mimeType)
    {
        if (!string.IsNullOrWhiteSpace(audioFileName))
        {
            return audioFileName.Trim();
        }

        var normalizedMimeType = mimeType.Trim().ToLowerInvariant();
        var extension = normalizedMimeType switch
        {
            "audio/mp3" => "mp3",
            "audio/mpeg" => "mp3",
            _ when normalizedMimeType.StartsWith("audio/", StringComparison.Ordinal) =>
                normalizedMimeType["audio/".Length..]
                    .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)[0]
                    .Split('+', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)[0]
                    .Trim(),
            _ => "wav",
        };
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = "wav";
        }

        return $"input.{extension}";
    }
}
