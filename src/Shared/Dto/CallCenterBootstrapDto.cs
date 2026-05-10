namespace Shared.Dto;

/// <summary>
/// 電話受付・AI 応答システムの初期表示に必要なデータ一式。
/// </summary>
/// <param name="CurrentOperator">現在ログイン中オペレーターの表示情報。</param>
/// <param name="SystemSettings">システム設定。</param>
/// <param name="IncomingCall">現在着信中のコール情報。</param>
/// <param name="CallRecords">通話履歴一覧。</param>
/// <param name="FaqItems">FAQ 一覧。</param>
/// <param name="TransferDestinations">転送先マスタ一覧。</param>
/// <param name="SystemPrompts">システムプロンプト一覧。</param>
/// <param name="DashboardStats">ダッシュボード集計値。</param>
public record CallCenterBootstrapDto(
    CurrentOperatorDto CurrentOperator,
    SystemSettingsDto SystemSettings,
    CallRecordDto IncomingCall,
    IReadOnlyList<CallRecordDto> CallRecords,
    IReadOnlyList<FaqItemDto> FaqItems,
    IReadOnlyList<TransferDestinationDto> TransferDestinations,
    IReadOnlyList<SystemPromptDto> SystemPrompts,
    IReadOnlyList<DashboardStatDto> DashboardStats);
