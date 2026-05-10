namespace Shared.Dto;

/// <summary>
/// システムプロンプトの表示情報。
/// </summary>
/// <param name="Id">プロンプト ID。</param>
/// <param name="Name">名称。</param>
/// <param name="Type">種別。</param>
/// <param name="Version">バージョン。</param>
/// <param name="Content">内容。</param>
/// <param name="Enabled">有効かどうか。</param>
/// <param name="UpdatedAt">更新日時。</param>
/// <param name="UpdatedBy">更新者。</param>
public record SystemPromptDto(
    string Id,
    string Name,
    string Type,
    string Version,
    string Content,
    bool Enabled,
    string UpdatedAt,
    string UpdatedBy);
