namespace Shared.Dto;

/// <summary>
/// システム設定更新リクエスト。
/// </summary>
/// <param name="BusinessHours">業務時間。</param>
/// <param name="AfterHoursMessage">業務時間外メッセージ。</param>
/// <param name="RejectMessage">お断りメッセージ。</param>
/// <param name="AiEnabled">AI 応答が有効かどうか。</param>
/// <param name="TestLoginEnabled">テストログインが有効かどうか。</param>
/// <param name="FaqScoreThreshold">FAQ スコア閾値。</param>
/// <param name="OperatorAssignmentRule">オペレーター割当ルール。</param>
public record UpdateSystemSettingsRequestDto(
    string BusinessHours,
    string AfterHoursMessage,
    string RejectMessage,
    bool AiEnabled,
    bool TestLoginEnabled,
    string FaqScoreThreshold,
    string OperatorAssignmentRule);
