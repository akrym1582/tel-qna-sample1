using Shared.Dto;

namespace Shared.Services;

/// <summary>
/// 通話の録音アーカイブを保存するストレージ。
/// </summary>
public interface ICallRecordingStorage
{
    /// <summary>
    /// 通話の録音アーカイブを保存し、参照先を返す。
    /// </summary>
    Task<string> SaveAsync(CallRecordDto callRecord, CancellationToken cancellationToken = default);
}
