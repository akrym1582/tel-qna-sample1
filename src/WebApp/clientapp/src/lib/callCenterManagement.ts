import type { ApiResponse } from '@/lib/apiResponse'
import { apiFetch } from '@/lib/aspida'
import type { CallRecord, FaqItem, SystemSettings, TransferDestination } from '@/lib/callCenterData'

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

export interface CreateTestIncomingCallRequest {
  callerNumber: string
  customerName: string
  customerType: string
  customerSummary: string
  requestedTopic: string
}

export interface AppendCurrentCallTranscriptRequest {
  speaker: '顧客' | 'オペレーター'
  text: string
}

async function requestJson<T>(path: string, method: 'POST' | 'PUT', body?: unknown): Promise<ApiResponse<T>> {
  const response = await apiFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  return (await response.json()) as ApiResponse<T>
}

export function updateFaq(faqId: string, request: UpdateFaqRequest) {
  return requestJson<FaqItem>(`/api/call-center/faqs/${faqId}`, 'PUT', request)
}

export function updateTransferDestination(
  destinationId: string,
  request: UpdateTransferDestinationRequest,
) {
  return requestJson<TransferDestination>(`/api/call-center/transfer-destinations/${destinationId}`, 'PUT', request)
}

export function updateSystemSettings(request: UpdateSystemSettingsRequest) {
  return requestJson<SystemSettings>('/api/call-center/system-settings', 'PUT', request)
}

export function createTestIncomingCall(request: CreateTestIncomingCallRequest) {
  return requestJson<CallRecord>('/api/call-center/test-calls', 'POST', request)
}

export function applyCurrentCallAction(action: 'receive' | 'ai' | 'reject') {
  return requestJson<CallRecord>(`/api/call-center/current-call/actions/${action}`, 'PUT')
}

export function appendCurrentCallTranscript(request: AppendCurrentCallTranscriptRequest) {
  return requestJson<CallRecord>('/api/call-center/current-call/transcript', 'POST', request)
}

export function generateAiResponse() {
  return requestJson<CallRecord>('/api/call-center/current-call/ai-response', 'POST')
}
