namespace Shared.Dto;

/// <summary>
/// FAQ の表示情報。
/// </summary>
/// <param name="Id">FAQ ID。</param>
/// <param name="Question">質問。</param>
/// <param name="Answer">回答。</param>
/// <param name="Category">カテゴリ。</param>
/// <param name="Keywords">キーワード一覧。</param>
/// <param name="Enabled">有効かどうか。</param>
/// <param name="UpdatedAt">更新日時。</param>
/// <param name="UpdatedBy">更新者。</param>
/// <param name="ScoreHint">検索スコア目安。</param>
public record FaqItemDto(
    string Id,
    string Question,
    string Answer,
    string Category,
    IReadOnlyList<string> Keywords,
    bool Enabled,
    string UpdatedAt,
    string UpdatedBy,
    string ScoreHint);
