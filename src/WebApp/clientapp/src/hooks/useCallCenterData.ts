import { useApi } from '@/hooks/useApi'
import type { ApiResponseDtoOfCallCenterBootstrapDto } from '@/api/@types'
import type { ApiResponse } from '@/lib/apiResponse'
import type { CallCenterBootstrap } from '@/lib/callCenterData'
import { apiClient } from '@/lib/apiClient'

export function useCallCenterData() {
  const { data, error, isLoading, mutate } = useApi<ApiResponseDtoOfCallCenterBootstrapDto>(apiClient.call_center.bootstrap)
  const response = data as ApiResponse<CallCenterBootstrap> | undefined

  return {
    data: response?.success ? response.data ?? undefined : undefined,
    isLoading,
    isError: !!error || !!(response && !response.success),
    message: response?.message ?? undefined,
    mutate,
  }
}
