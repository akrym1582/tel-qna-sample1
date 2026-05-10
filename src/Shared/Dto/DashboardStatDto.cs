namespace Shared.Dto;

/// <summary>
/// ダッシュボードの集計表示 1 件。
/// </summary>
/// <param name="Label">表示ラベル。</param>
/// <param name="Value">表示値。</param>
public record DashboardStatDto(string Label, string Value);
