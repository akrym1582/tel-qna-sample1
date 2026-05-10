namespace Shared.Dto;

/// <summary>
/// 現在着信へのイベント反映リクエスト。
/// </summary>
/// <param name="EventType">イベント種別。</param>
/// <param name="Actor">実行者。</param>
/// <param name="Detail">詳細メッセージ。</param>
/// <param name="Status">更新後ステータス。</param>
/// <param name="ResponseMode">更新後応答方式。</param>
/// <param name="AiSummary">更新後 AI サマリ。</param>
/// <param name="RecordingLocation">録音保存先。</param>
/// <param name="EndedAt">終了時刻。</param>
public record CallEventUpdateRequestDto(
    string EventType,
    string Actor,
    string Detail,
    string? Status,
    string? ResponseMode,
    string? AiSummary,
    string? RecordingLocation,
    string? EndedAt);
