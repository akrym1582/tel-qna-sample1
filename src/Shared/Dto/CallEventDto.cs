namespace Shared.Dto;

/// <summary>
/// 通話イベント履歴 1 件。
/// </summary>
/// <param name="At">発生時刻。</param>
/// <param name="Type">イベント種別。</param>
/// <param name="Actor">実行者。</param>
/// <param name="Detail">詳細。</param>
public record CallEventDto(string At, string Type, string Actor, string Detail);
