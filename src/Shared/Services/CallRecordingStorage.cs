using System.Text.Json;
using Azure.Storage.Blobs;
using Shared.Dto;
using Shared.Util;

namespace Shared.Services;

/// <summary>
/// 通話の録音アーカイブを Azure Blob Storage に保存する。
/// </summary>
public class CallRecordingStorage : ICallRecordingStorage
{
    private const string ContainerName = "call-recordings";
    private const string NotSavedRecordingLocation = "未保存";
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private readonly BlobContainerClient _containerClient;

    /// <summary>
    /// <see cref="CallRecordingStorage"/> の新しいインスタンスを初期化する。
    /// </summary>
    /// <param name="blobServiceClient">Azure Blob Storage クライアント。</param>
    public CallRecordingStorage(BlobServiceClient blobServiceClient)
    {
        _containerClient = blobServiceClient.GetBlobContainerClient(ContainerName);
        _containerClient.CreateIfNotExists();
    }

    /// <inheritdoc/>
    public async Task<string> SaveAsync(CallRecordDto callRecord, CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient($"{callRecord.Id}.json");
        var payload = JsonSerializer.Serialize(
            BuildArchivePayload(callRecord),
            SerializerOptions);
        using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(payload));
        await blobClient.UploadAsync(stream, overwrite: true, cancellationToken);

        return string.IsNullOrWhiteSpace(callRecord.RecordingLocation) || callRecord.RecordingLocation == NotSavedRecordingLocation
            ? blobClient.Uri.ToString()
            : callRecord.RecordingLocation;
    }

    private static object BuildArchivePayload(CallRecordDto callRecord)
    {
        var latestTranscriptLine = callRecord.Transcript.LastOrDefault();
        var durationSeconds = CallProcessingHelper.CalculateDurationSeconds(callRecord);
        var recordingStatus = string.IsNullOrWhiteSpace(callRecord.EndedAt) ? "recording" : "completed";
        return new
        {
            callId = callRecord.Id,
            customer = new
            {
                id = callRecord.CustomerId,
                name = callRecord.CustomerName,
                type = callRecord.CustomerType,
                summary = callRecord.CustomerSummary,
            },
            recording = new
            {
                archiveFormat = "json",
                status = recordingStatus,
                startedAt = callRecord.ReceivedAt,
                endedAt = string.IsNullOrWhiteSpace(callRecord.EndedAt) ? null : callRecord.EndedAt,
                durationSeconds,
                updatedAt = DateTime.UtcNow.ToString("O"),
            },
            transcript = new
            {
                lineCount = callRecord.Transcript.Count,
                fullText = CallProcessingHelper.BuildTranscriptText(callRecord),
                latestLine = latestTranscriptLine,
                lines = callRecord.Transcript,
            },
            summary = new
            {
                aiSummary = callRecord.AiSummary,
                transferRequired = callRecord.TransferRequired,
                transferDestinationId = callRecord.TransferDestinationId,
                transferDestinationName = callRecord.TransferDestinationName,
                transferReason = callRecord.TransferReason,
            },
            events = callRecord.Events,
            transferHistory = callRecord.TransferHistory,
            exportedAt = DateTime.UtcNow.ToString("O"),
        };
    }
}
