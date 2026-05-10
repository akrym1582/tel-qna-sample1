import type { ApiResponse } from '@/lib/apiResponse'
import { apiFetch } from '@/lib/aspida'
import type { FaqItem, SystemSettings, TransferDestination } from '@/lib/callCenterData'

export interface UpdateFaqRequest {
  question: string
  answer: string
  category: string
  keywords: string[]
  enabled: boolean
  scoreHint: string
}

export interface UpdateTransferDestinationRequest {
  name: string
  type: string
  department: string
  target: string
  businessHours: string
  priority: number
  hint: string
  fallbackName: string
  enabled: boolean
}

export interface UpdateSystemSettingsRequest {
  businessHours: string
  afterHoursMessage: string
  rejectMessage: string
  aiEnabled: boolean
  testLoginEnabled: boolean
  faqScoreThreshold: string
  operatorAssignmentRule: string
}

async function putJson<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const response = await apiFetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return (await response.json()) as ApiResponse<T>
}

export function updateFaq(faqId: string, request: UpdateFaqRequest) {
  return putJson<FaqItem>(`/api/call-center/faqs/${faqId}`, request)
}

export function updateTransferDestination(
  destinationId: string,
  request: UpdateTransferDestinationRequest,
) {
  return putJson<TransferDestination>(`/api/call-center/transfer-destinations/${destinationId}`, request)
}

export function updateSystemSettings(request: UpdateSystemSettingsRequest) {
  return putJson<SystemSettings>('/api/call-center/system-settings', request)
}
