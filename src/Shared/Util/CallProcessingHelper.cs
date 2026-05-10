using System.Globalization;
using System.Text;
using Shared.Dto;

namespace Shared.Util;

/// <summary>
/// 通話の文字起こし・要約・FAQ 中間一致検索を補助するヘルパー。
/// </summary>
public static class CallProcessingHelper
{
    private const int MinimumMatchLength = 3;

    /// <summary>
    /// 通話内容から関連 FAQ を文字列中間一致で抽出する。
    /// </summary>
    /// <param name="callRecord">対象通話。</param>
    /// <param name="faqItems">FAQ 一覧。</param>
    /// <param name="maxCount">返却件数上限。</param>
    /// <returns>関連度順の FAQ 一覧。</returns>
    public static IReadOnlyList<FaqItemDto> FindRelevantFaqs(
        CallRecordDto callRecord,
        IEnumerable<FaqItemDto> faqItems,
        int maxCount = 3)
    {
        ArgumentNullException.ThrowIfNull(callRecord);
        ArgumentNullException.ThrowIfNull(faqItems);

        var searchTexts = BuildSearchTexts(callRecord);
        return faqItems
            .Where(faq => faq.Enabled)
            .Select(faq => new
            {
                Faq = faq,
                Score = CalculateFaqScore(faq, searchTexts),
            })
            .Where(item => item.Score > 0)
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.Faq.Question, StringComparer.Ordinal)
            .Take(maxCount)
            .Select(item => item.Faq)
            .ToList();
    }

    /// <summary>
    /// 通話中の顧客要約を構築する。
    /// </summary>
    /// <param name="callRecord">対象通話。</param>
    /// <param name="fallbackSummary">既存要約。</param>
    /// <returns>顧客要約。</returns>
    public static string BuildCustomerSummary(CallRecordDto callRecord, string? fallbackSummary = null)
    {
        ArgumentNullException.ThrowIfNull(callRecord);

        var customerLines = callRecord.Transcript
            .Where(line => line.Speaker == "顧客" && !string.IsNullOrWhiteSpace(line.Text))
            .Select(line => line.Text.Trim())
            .Distinct(StringComparer.Ordinal)
            .TakeLast(2)
            .ToList();
        if (customerLines.Count == 0)
        {
            return string.IsNullOrWhiteSpace(fallbackSummary) ? "顧客要件を確認中です。" : fallbackSummary.Trim();
        }

        return customerLines.Count == 1
            ? $"顧客要件: {customerLines[0]}"
            : $"顧客要件: {customerLines[0]} / 最新発話: {customerLines[1]}";
    }

    /// <summary>
    /// 文字起こしの最新内容から運用向け要約を構築する。
    /// </summary>
    /// <param name="callRecord">対象通話。</param>
    /// <param name="matchedFaqs">一致した FAQ。</param>
    /// <param name="fallbackSummary">既存要約。</param>
    /// <returns>要約文。</returns>
    public static string BuildTranscriptSummary(
        CallRecordDto callRecord,
        IEnumerable<FaqItemDto> matchedFaqs,
        string? fallbackSummary = null)
    {
        ArgumentNullException.ThrowIfNull(callRecord);
        ArgumentNullException.ThrowIfNull(matchedFaqs);

        var latestLine = callRecord.Transcript.LastOrDefault();
        var faqLabel = matchedFaqs
            .Select(faq => faq.Question)
            .Take(2)
            .ToList();
        var faqText = faqLabel.Count == 0
            ? "FAQ 候補は未検出です。"
            : $"FAQ 候補: {string.Join(" / ", faqLabel)}";
        if (latestLine is null || string.IsNullOrWhiteSpace(latestLine.Text))
        {
            return string.IsNullOrWhiteSpace(fallbackSummary)
                ? faqText
                : $"{fallbackSummary.Trim()} / {faqText}";
        }

        var latestText = $"{latestLine.Speaker}「{latestLine.Text.Trim()}」";
        return string.IsNullOrWhiteSpace(fallbackSummary)
            ? $"{faqText} 最新発話: {latestText}"
            : $"{fallbackSummary.Trim()} / {faqText} / 最新発話: {latestText}";
    }

    /// <summary>
    /// 文字起こし全文を 1 つの文字列へ整形する。
    /// </summary>
    /// <param name="callRecord">対象通話。</param>
    /// <returns>整形済み全文。</returns>
    public static string BuildTranscriptText(CallRecordDto callRecord)
    {
        ArgumentNullException.ThrowIfNull(callRecord);

        return string.Join(
            Environment.NewLine,
            callRecord.Transcript.Select(line => $"{line.At} {line.Speaker}: {line.Text}"));
    }

    /// <summary>
    /// 開始・終了時刻から通話秒数を算出する。
    /// </summary>
    /// <param name="callRecord">対象通話。</param>
    /// <returns>通話秒数。算出できない場合は null。</returns>
    public static int? CalculateDurationSeconds(CallRecordDto callRecord)
    {
        ArgumentNullException.ThrowIfNull(callRecord);

        if (!DateTime.TryParse(callRecord.ReceivedAt, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var receivedAt) ||
            !DateTime.TryParse(callRecord.EndedAt, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var endedAt))
        {
            return null;
        }

        var duration = endedAt - receivedAt;
        return duration.TotalSeconds < 0 ? null : (int)Math.Round(duration.TotalSeconds, MidpointRounding.AwayFromZero);
    }

    private static int CalculateFaqScore(FaqItemDto faq, IReadOnlyList<string> searchTexts)
    {
        var faqTexts = new[] { faq.Question, faq.Answer, faq.Category }.Concat(faq.Keywords);
        var bestScore = 0;

        foreach (var searchText in searchTexts)
        {
            if (string.IsNullOrWhiteSpace(searchText))
            {
                continue;
            }

            foreach (var faqText in faqTexts)
            {
                var candidateText = NormalizeText(faqText);
                if (string.IsNullOrWhiteSpace(candidateText))
                {
                    continue;
                }

                bestScore = Math.Max(bestScore, CalculateSubstringScore(searchText, candidateText));
            }
        }

        return bestScore;
    }

    private static int CalculateSubstringScore(string sourceText, string candidateText)
    {
        if (sourceText.Contains(candidateText, StringComparison.Ordinal))
        {
            return 1000 + candidateText.Length;
        }

        if (candidateText.Contains(sourceText, StringComparison.Ordinal) && sourceText.Length >= MinimumMatchLength)
        {
            return 900 + sourceText.Length;
        }

        var commonLength = CalculateLongestCommonSubstringLength(sourceText, candidateText);
        return commonLength >= MinimumMatchLength ? commonLength : 0;
    }

    private static int CalculateLongestCommonSubstringLength(string left, string right)
    {
        var previousRow = new int[right.Length + 1];
        var currentRow = new int[right.Length + 1];
        var bestLength = 0;

        for (var leftIndex = 1; leftIndex <= left.Length; leftIndex++)
        {
            for (var rightIndex = 1; rightIndex <= right.Length; rightIndex++)
            {
                if (left[leftIndex - 1] == right[rightIndex - 1])
                {
                    currentRow[rightIndex] = previousRow[rightIndex - 1] + 1;
                    bestLength = Math.Max(bestLength, currentRow[rightIndex]);
                }
                else
                {
                    currentRow[rightIndex] = 0;
                }
            }

            Array.Clear(previousRow);
            (previousRow, currentRow) = (currentRow, previousRow);
        }

        return bestLength;
    }

    private static IReadOnlyList<string> BuildSearchTexts(CallRecordDto callRecord)
    {
        var latestCustomerText = callRecord.Transcript.LastOrDefault(line => line.Speaker == "顧客")?.Text ?? string.Empty;
        return new[]
        {
            BuildTranscriptText(callRecord),
            latestCustomerText,
            callRecord.CustomerSummary,
        }
        .Select(NormalizeText)
        .Where(text => !string.IsNullOrWhiteSpace(text))
        .ToList();
    }

    private static string NormalizeText(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var builder = new StringBuilder(text.Length);
        foreach (var character in text.Normalize(NormalizationForm.FormKC))
        {
            if (char.IsWhiteSpace(character) || char.IsPunctuation(character) || char.IsSymbol(character))
            {
                continue;
            }

            builder.Append(char.ToLowerInvariant(character));
        }

        return builder.ToString();
    }
}
