using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Shared.Dto;
using Shared.Util;

namespace Shared.Services;

/// <summary>
/// Azure AI Foundry の gpt-realtime-2 を使って AI 応答を生成するサービス。
/// </summary>
public class AiCallResponseService : IAiCallResponseService
{
    /// <summary>
    /// Azure AI Foundry で代表電話の一次受付に使う realtime モデル名。
    /// </summary>
    private const string ModelName = "gpt-realtime-2";
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private readonly AiFoundrySettings _settings;

    /// <summary>
    /// <see cref="AiCallResponseService"/> の新しいインスタンスを初期化する。
    /// </summary>
    /// <param name="settings">Azure AI Foundry 接続設定。</param>
    public AiCallResponseService(AiFoundrySettings settings)
    {
        _settings = settings;
    }

    /// <inheritdoc/>
    public async Task<AiCallResponseDto> GenerateResponseAsync(
        CallCenterBootstrapDto bootstrap,
        CancellationToken cancellationToken = default)
    {
        if (!IsConfigured())
        {
            return GenerateMockResponse(bootstrap);
        }

        try
        {
            return await GenerateWithRealtimeApiAsync(bootstrap, cancellationToken);
        }
        catch when (_settings.UseMockWhenUnavailable)
        {
            return GenerateMockResponse(bootstrap);
        }
    }

    private static string BuildConversationPrompt(CallCenterBootstrapDto bootstrap)
    {
        var currentCall = bootstrap.IncomingCall;
        var latestPrompt = bootstrap.SystemPrompts.FirstOrDefault(prompt => prompt.Enabled)
            ?.Content
            ?? "顧客の用件を整理し、解決可否と転送要否を判断してください。";
        var transcript = string.Join(
            Environment.NewLine,
            currentCall.Transcript.Select(line => $"{line.Speaker}({line.At}): {line.Text}"));
        var faqItems = string.Join(
            Environment.NewLine,
            bootstrap.FaqItems
                .Where(faq => faq.Enabled)
                .Take(5)
                .Select(faq => $"- 質問: {faq.Question} / 回答: {faq.Answer} / キーワード: {string.Join(", ", faq.Keywords)}"));
        var transferDestinations = string.Join(
            Environment.NewLine,
            bootstrap.TransferDestinations
                .Where(destination => destination.Enabled)
                .Take(5)
                .Select(destination => $"- {destination.Id} {destination.Name} / {destination.Department} / ヒント: {destination.Hint}"));
        var promptBuilder = new StringBuilder();
        promptBuilder.AppendLine("あなたは代表電話の AI 受付です。必ず日本語で応答してください。");
        promptBuilder.AppendLine("次の JSON だけを返してください。");
        promptBuilder.AppendLine("{");
        promptBuilder.AppendLine("  \"assistantReply\": \"顧客に伝える応答本文\",");
        promptBuilder.AppendLine("  \"aiSummary\": \"通話要約\",");
        promptBuilder.AppendLine("  \"transferRequired\": true,");
        promptBuilder.AppendLine("  \"transferDestinationId\": \"TR-001 または null\",");
        promptBuilder.AppendLine("  \"transferDestinationName\": \"転送先名 または null\",");
        promptBuilder.AppendLine("  \"transferReason\": \"転送理由 または null\"");
        promptBuilder.AppendLine("}");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("代表電話向けシステムプロンプト:");
        promptBuilder.AppendLine(latestPrompt);
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("システム設定:");
        promptBuilder.AppendLine($"- 営業時間: {bootstrap.SystemSettings.BusinessHours}");
        promptBuilder.AppendLine($"- FAQ 閾値: {bootstrap.SystemSettings.FaqScoreThreshold}");
        promptBuilder.AppendLine($"- 振り分けルール: {bootstrap.SystemSettings.OperatorAssignmentRule}");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("顧客情報:");
        promptBuilder.AppendLine($"- 顧客名: {currentCall.CustomerName}");
        promptBuilder.AppendLine($"- 顧客種別: {currentCall.CustomerType}");
        promptBuilder.AppendLine($"- 顧客要約: {currentCall.CustomerSummary}");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("文字起こし:");
        promptBuilder.AppendLine(transcript);
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("FAQ:");
        promptBuilder.AppendLine(faqItems);
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("転送先候補:");
        promptBuilder.AppendLine(transferDestinations);
        return promptBuilder.ToString();
    }

    private static AiCallResponseDto GenerateMockResponse(CallCenterBootstrapDto bootstrap)
    {
        var currentCall = bootstrap.IncomingCall;
        var latestCustomerText = currentCall.Transcript.LastOrDefault(line => line.Speaker == "顧客")?.Text
            ?? currentCall.CustomerSummary;
        var matchingFaq = bootstrap.FaqItems
            .Where(faq => faq.Enabled)
            .FirstOrDefault(faq =>
                faq.Keywords.Any(keyword => latestCustomerText.Contains(keyword, StringComparison.OrdinalIgnoreCase)) ||
                latestCustomerText.Contains(faq.Question, StringComparison.OrdinalIgnoreCase));

        if (matchingFaq is not null)
        {
            return new AiCallResponseDto(
                AssistantReply: $"Azure AI Foundry ({ModelName}) 応答: {matchingFaq.Answer}",
                AiSummary: $"問い合わせ内容を {matchingFaq.Category} FAQ と照合し、自己解決可能と判断しました。",
                TransferRequired: false,
                TransferDestinationId: null,
                TransferDestinationName: null,
                TransferReason: null);
        }

        var matchingDestination = bootstrap.TransferDestinations
            .Where(destination => destination.Enabled)
            .OrderBy(destination => destination.Priority)
            .FirstOrDefault(destination =>
                latestCustomerText.Contains(destination.Department, StringComparison.OrdinalIgnoreCase) ||
                latestCustomerText.Contains(destination.Hint, StringComparison.OrdinalIgnoreCase))
            ?? bootstrap.TransferDestinations.Where(destination => destination.Enabled).OrderBy(destination => destination.Priority).FirstOrDefault();

        return new AiCallResponseDto(
            AssistantReply: matchingDestination is null
                ? $"Azure AI Foundry ({ModelName}) 応答: 内容を整理し、担当者から折り返し連絡する旨をご案内します。"
                : $"Azure AI Foundry ({ModelName}) 応答: 内容を確認しました。{matchingDestination.Name} での対応が適切なため、順次おつなぎします。",
            AiSummary: matchingDestination is null
                ? "FAQ では完結せず、折り返し対応が必要と判断しました。"
                : $"{matchingDestination.Name} への転送が適切と判断しました。問い合わせ内容と顧客属性を引き継ぎます。",
            TransferRequired: matchingDestination is not null,
            TransferDestinationId: matchingDestination?.Id,
            TransferDestinationName: matchingDestination?.Name,
            TransferReason: matchingDestination is null ? null : latestCustomerText);
    }

    private bool IsConfigured() =>
        !string.IsNullOrWhiteSpace(_settings.Endpoint) &&
        !string.IsNullOrWhiteSpace(_settings.ApiKey) &&
        !string.IsNullOrWhiteSpace(_settings.Deployment);

    private async Task<AiCallResponseDto> GenerateWithRealtimeApiAsync(
        CallCenterBootstrapDto bootstrap,
        CancellationToken cancellationToken)
    {
        using var socket = new ClientWebSocket();
        socket.Options.SetRequestHeader("api-key", _settings.ApiKey);

        await socket.ConnectAsync(BuildWebSocketUri(), cancellationToken);
        await SendJsonAsync(
            socket,
            new
            {
                type = "session.update",
                session = new
                {
                    instructions = "代表電話の一次受付 AI として動作し、必ず JSON だけを返してください。",
                    output_modalities = new[] { "text" },
                },
            },
            cancellationToken);
        await SendJsonAsync(
            socket,
            new
            {
                type = "conversation.item.create",
                item = new
                {
                    type = "message",
                    role = "user",
                    content = new[]
                    {
                        new
                        {
                            type = "input_text",
                            text = BuildConversationPrompt(bootstrap),
                        },
                    },
                },
            },
            cancellationToken);
        await SendJsonAsync(
            socket,
            new
            {
                type = "response.create",
                response = new
                {
                    modalities = new[] { "text" },
                },
            },
            cancellationToken);

        var payload = await ReceiveResponsePayloadAsync(socket, cancellationToken);
        return ParseRealtimeResponse(payload);
    }

    private Uri BuildWebSocketUri()
    {
        var endpoint = _settings.Endpoint.TrimEnd('/');
        var websocketEndpoint = endpoint
            .Replace("https://", "wss://", StringComparison.OrdinalIgnoreCase)
            .Replace("http://", "ws://", StringComparison.OrdinalIgnoreCase);
        var apiVersion = Uri.EscapeDataString(_settings.ApiVersion);
        var deployment = Uri.EscapeDataString(_settings.Deployment);
        return new Uri($"{websocketEndpoint}/openai/realtime?api-version={apiVersion}&deployment={deployment}");
    }

    private static AiCallResponseDto ParseRealtimeResponse(string payload)
    {
        var json = ExtractJsonObject(payload);
        var response = JsonSerializer.Deserialize<AiCallResponseDto>(json, SerializerOptions);
        if (response is null || string.IsNullOrWhiteSpace(response.AssistantReply) || string.IsNullOrWhiteSpace(response.AiSummary))
        {
            throw new InvalidOperationException("Azure AI Foundry の応答を解析できませんでした。");
        }

        return response;
    }

    private static string ExtractJsonObject(string payload)
    {
        var startIndex = payload.IndexOf('{', StringComparison.Ordinal);
        var endIndex = payload.LastIndexOf('}');
        if (startIndex < 0 || endIndex <= startIndex)
        {
            throw new InvalidOperationException("Azure AI Foundry の応答に JSON が含まれていません。");
        }

        return payload[startIndex..(endIndex + 1)];
    }

    private static async Task<string> ReceiveResponsePayloadAsync(
        ClientWebSocket socket,
        CancellationToken cancellationToken)
    {
        var buffer = new byte[16 * 1024];
        var rawMessages = new List<string>();
        var textBuilder = new StringBuilder();

        while (socket.State == WebSocketState.Open)
        {
            using var messageBuffer = new MemoryStream();
            WebSocketReceiveResult receiveResult;
            do
            {
                receiveResult = await socket.ReceiveAsync(buffer, cancellationToken);
                if (receiveResult.MessageType == WebSocketMessageType.Close)
                {
                    return textBuilder.Length > 0 ? textBuilder.ToString() : string.Join(Environment.NewLine, rawMessages);
                }

                messageBuffer.Write(buffer.AsSpan(0, receiveResult.Count));
            }
            while (!receiveResult.EndOfMessage);

            var messageText = Encoding.UTF8.GetString(messageBuffer.ToArray());
            rawMessages.Add(messageText);

            if (!TryAppendPayloadText(messageText, textBuilder) &&
                messageText.Contains("\"type\":\"response.done\"", StringComparison.Ordinal))
            {
                return textBuilder.Length > 0 ? textBuilder.ToString() : string.Join(Environment.NewLine, rawMessages);
            }

            if (messageText.Contains("\"type\":\"response.done\"", StringComparison.Ordinal))
            {
                return textBuilder.Length > 0 ? textBuilder.ToString() : string.Join(Environment.NewLine, rawMessages);
            }
        }

        return textBuilder.Length > 0 ? textBuilder.ToString() : string.Join(Environment.NewLine, rawMessages);
    }

    private static async Task SendJsonAsync(
        ClientWebSocket socket,
        object payload,
        CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(payload, SerializerOptions);
        var bytes = Encoding.UTF8.GetBytes(json);
        await socket.SendAsync(bytes, WebSocketMessageType.Text, true, cancellationToken);
    }

    private static bool TryAppendPayloadText(string messageText, StringBuilder textBuilder)
    {
        using var document = JsonDocument.Parse(messageText);
        if (!document.RootElement.TryGetProperty("type", out var typeElement))
        {
            return false;
        }

        var eventType = typeElement.GetString() ?? string.Empty;
        if (eventType.EndsWith(".delta", StringComparison.Ordinal) &&
            TryGetString(document.RootElement, out var deltaText, "delta"))
        {
            textBuilder.Append(deltaText);
            return true;
        }

        if (eventType.Contains("output_text", StringComparison.Ordinal) &&
            TryGetString(document.RootElement, out var outputText, "text"))
        {
            textBuilder.Append(outputText);
            return true;
        }

        if (eventType.Contains("conversation.item", StringComparison.Ordinal) &&
            document.RootElement.TryGetProperty("item", out var itemElement) &&
            itemElement.TryGetProperty("content", out var contentElement) &&
            contentElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var contentItem in contentElement.EnumerateArray())
            {
                if (TryGetString(contentItem, out var textValue, "text"))
                {
                    textBuilder.Append(textValue);
                    return true;
                }
            }
        }

        if (eventType == "response.done" &&
            document.RootElement.TryGetProperty("response", out var responseElement) &&
            responseElement.TryGetProperty("output", out var outputElement) &&
            outputElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var outputItem in outputElement.EnumerateArray())
            {
                if (!outputItem.TryGetProperty("content", out var outputContentElement) ||
                    outputContentElement.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var contentItem in outputContentElement.EnumerateArray())
                {
                    if (TryGetString(contentItem, out var textValue, "text"))
                    {
                        textBuilder.Append(textValue);
                    }
                }
            }

            return textBuilder.Length > 0;
        }

        return false;
    }

    private static bool TryGetString(JsonElement element, out string value, params string[] propertyNames)
    {
        var current = element;
        foreach (var propertyName in propertyNames)
        {
            if (!current.TryGetProperty(propertyName, out current))
            {
                value = string.Empty;
                return false;
            }
        }

        value = current.ValueKind == JsonValueKind.String ? current.GetString() ?? string.Empty : current.ToString();
        return !string.IsNullOrWhiteSpace(value);
    }
}
