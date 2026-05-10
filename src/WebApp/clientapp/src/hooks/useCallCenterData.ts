import { useApi } from '@/hooks/useApi'
import type { ApiResponse } from '@/lib/apiResponse'
import type { CallCenterBootstrap } from '@/lib/callCenterData'

const CALL_CENTER_BOOTSTRAP_PATH = '/api/call-center/bootstrap'

export function useCallCenterData() {
  const { data, error, isLoading, mutate } = useApi<ApiResponse<CallCenterBootstrap>>(CALL_CENTER_BOOTSTRAP_PATH)

  return {
    data: data?.success ? data.data ?? undefined : undefined,
    isLoading,
    isError: !!error || !!(data && !data.success),
    message: data?.message ?? undefined,
    mutate,
  }
}
