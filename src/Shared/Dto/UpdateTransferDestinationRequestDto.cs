namespace Shared.Dto;

/// <summary>
/// 転送先更新リクエスト。
/// </summary>
/// <param name="Name">名称。</param>
/// <param name="Type">種別。</param>
/// <param name="Department">部署名。</param>
/// <param name="Target">電話番号または識別子。</param>
/// <param name="BusinessHours">営業時間。</param>
/// <param name="Priority">優先度。</param>
/// <param name="Hint">ヒント情報。</param>
/// <param name="FallbackName">フォールバック先名。</param>
/// <param name="Enabled">有効かどうか。</param>
public record UpdateTransferDestinationRequestDto(
    string Name,
    string Type,
    string Department,
    string Target,
    string BusinessHours,
    int Priority,
    string Hint,
    string FallbackName,
    bool Enabled);
