namespace Shared.Dto;

/// <summary>
/// オペレーターの表示情報。
/// </summary>
/// <param name="Id">オペレーター ID。</param>
/// <param name="Name">オペレーター名。</param>
/// <param name="Role">ロール名。</param>
/// <param name="Team">所属チーム名。</param>
public record CurrentOperatorDto(string Id, string Name, string Role, string Team);
