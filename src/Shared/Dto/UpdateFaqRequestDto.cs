namespace Shared.Dto;

/// <summary>
/// FAQ 更新リクエスト。
/// </summary>
/// <param name="Question">質問。</param>
/// <param name="Answer">回答。</param>
/// <param name="Category">カテゴリ。</param>
/// <param name="Keywords">キーワード一覧。</param>
/// <param name="Enabled">有効かどうか。</param>
/// <param name="ScoreHint">検索スコア目安。</param>
public record UpdateFaqRequestDto(
    string Question,
    string Answer,
    string Category,
    IReadOnlyList<string> Keywords,
    bool Enabled,
    string ScoreHint);
