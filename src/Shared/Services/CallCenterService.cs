using Shared.Dto;
using Shared.Repository;

namespace Shared.Services;

/// <summary>
/// 電話受付・AI 応答システム向けの表示データを提供するサービス実装。
/// </summary>
public class CallCenterService : ICallCenterService
{
    private readonly ICallCenterRepository _repository;

    /// <summary>
    /// <see cref="CallCenterService"/> の新しいインスタンスを初期化する。
    /// </summary>
    /// <param name="repository">電話受付データリポジトリ。</param>
    public CallCenterService(ICallCenterRepository repository)
    {
        _repository = repository;
    }

    /// <inheritdoc/>
    public async Task<CallCenterBootstrapDto> GetBootstrapAsync() =>
        await _repository.GetBootstrapAsync();

    /// <inheritdoc/>
    public async Task<FaqItemDto?> UpdateFaqAsync(string faqId, UpdateFaqRequestDto request)
    {
        var normalizedRequest = request with
        {
            Question = request.Question.Trim(),
            Answer = request.Answer.Trim(),
            Category = request.Category.Trim(),
            Keywords = request.Keywords
                .Select(keyword => keyword.Trim())
                .Where(keyword => !string.IsNullOrWhiteSpace(keyword))
                .Distinct(StringComparer.Ordinal)
                .ToList(),
            ScoreHint = request.ScoreHint.Trim(),
        };

        return await _repository.UpdateFaqAsync(faqId, normalizedRequest);
    }

    /// <inheritdoc/>
    public async Task<TransferDestinationDto?> UpdateTransferDestinationAsync(
        string destinationId,
        UpdateTransferDestinationRequestDto request)
    {
        var normalizedRequest = request with
        {
            Name = request.Name.Trim(),
            Type = request.Type.Trim(),
            Department = request.Department.Trim(),
            Target = request.Target.Trim(),
            BusinessHours = request.BusinessHours.Trim(),
            Hint = request.Hint.Trim(),
            FallbackName = request.FallbackName.Trim(),
        };

        return await _repository.UpdateTransferDestinationAsync(destinationId, normalizedRequest);
    }

    /// <inheritdoc/>
    public async Task<SystemSettingsDto> UpdateSystemSettingsAsync(UpdateSystemSettingsRequestDto request)
    {
        var normalizedRequest = request with
        {
            BusinessHours = request.BusinessHours.Trim(),
            AfterHoursMessage = request.AfterHoursMessage.Trim(),
            RejectMessage = request.RejectMessage.Trim(),
            FaqScoreThreshold = request.FaqScoreThreshold.Trim(),
            OperatorAssignmentRule = request.OperatorAssignmentRule.Trim(),
        };

        return await _repository.UpdateSystemSettingsAsync(normalizedRequest);
    }

    /// <inheritdoc/>
    public async Task<CallRecordDto> CreateIncomingCallAsync(CreateTestIncomingCallRequestDto request, string source)
    {
        var normalizedRequest = request with
        {
            CallerNumber = request.CallerNumber.Trim(),
            CustomerName = request.CustomerName.Trim(),
            CustomerType = request.CustomerType.Trim(),
            CustomerSummary = request.CustomerSummary.Trim(),
            RequestedTopic = request.RequestedTopic.Trim(),
        };

        return await _repository.CreateIncomingCallAsync(normalizedRequest, source.Trim());
    }

    /// <inheritdoc/>
    public async Task<CallRecordDto> ApplyCurrentCallActionAsync(string action) =>
        await _repository.ApplyCurrentCallActionAsync(action.Trim());

    /// <inheritdoc/>
    public async Task<CallRecordDto> ApplyCurrentCallEventAsync(CallEventUpdateRequestDto request)
    {
        var normalizedRequest = request with
        {
            EventType = request.EventType.Trim(),
            Actor = request.Actor.Trim(),
            Detail = request.Detail.Trim(),
            Status = request.Status?.Trim(),
            ResponseMode = request.ResponseMode?.Trim(),
            AiSummary = request.AiSummary?.Trim(),
            RecordingLocation = request.RecordingLocation?.Trim(),
            EndedAt = request.EndedAt?.Trim(),
        };

        return await _repository.ApplyCurrentCallEventAsync(normalizedRequest);
    }
}
