import { useApi } from '@/hooks/useApi'
import type { ApiResponseDtoOfCallCenterBootstrapDto } from '@/api/@types'
import type { CallCenterBootstrap } from '@/lib/callCenterData'
import { apiClient } from '@/lib/apiClient'

export function useCallCenterData() {
  const { data, error, isLoading, mutate } = useApi<ApiResponseDtoOfCallCenterBootstrapDto>(apiClient.call_center.bootstrap)

  return {
    data: data?.success ? (data.data as CallCenterBootstrap | null | undefined) ?? undefined : undefined,
    isLoading,
    isError: !!error || !!(data && !data.success),
    message: data?.message ?? undefined,
    mutate,
  }
}
