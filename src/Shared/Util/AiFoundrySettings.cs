namespace Shared.Util;

/// <summary>
/// Azure AI Foundry Realtime API の接続設定。
/// </summary>
public class AiFoundrySettings
{
    /// <summary>
    /// Azure OpenAI / Azure AI Foundry の HTTPS エンドポイント。
    /// </summary>
    public string Endpoint { get; set; } = string.Empty;

    /// <summary>
    /// gpt-realtime-2 のデプロイ名。
    /// </summary>
    public string Deployment { get; set; } = "gpt-realtime-2";

    /// <summary>
    /// API キー。
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Realtime API のバージョン。
    /// </summary>
    public string ApiVersion { get; set; } = "2025-04-01-preview";

    /// <summary>
    /// 外部接続に失敗した場合にサンプル応答へフォールバックするか。
    /// </summary>
    public bool UseMockWhenUnavailable { get; set; } = true;
}
