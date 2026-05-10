using System.Text.Json;
using Azure.Storage.Blobs;
using Shared.Dto;

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
            new
            {
                callId = callRecord.Id,
                customerName = callRecord.CustomerName,
                customerType = callRecord.CustomerType,
                aiSummary = callRecord.AiSummary,
                transcript = callRecord.Transcript,
                events = callRecord.Events,
                exportedAt = DateTime.UtcNow.ToString("O"),
            },
            SerializerOptions);
        using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(payload));
        await blobClient.UploadAsync(stream, overwrite: true, cancellationToken);

        return string.IsNullOrWhiteSpace(callRecord.RecordingLocation) || callRecord.RecordingLocation == NotSavedRecordingLocation
            ? blobClient.Uri.ToString()
            : callRecord.RecordingLocation;
    }
}
