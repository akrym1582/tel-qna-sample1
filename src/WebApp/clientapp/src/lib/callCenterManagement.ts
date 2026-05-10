import { asApiResponse } from '@/lib/apiResponse'
import type { CallRecord, FaqItem, SystemSettings, TransferDestination } from '@/lib/callCenterData'
import { apiClientNoThrow } from '@/lib/apiClient'

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
  audioBase64?: string
  audioMimeType?: string
  audioFileName?: string
}

export function updateFaq(faqId: string, request: UpdateFaqRequest) {
  return apiClientNoThrow.call_center.faqs._faqId(faqId)
    .$put({ body: request })
    .then(asApiResponse<FaqItem>)
}

export function updateTransferDestination(
  destinationId: string,
  request: UpdateTransferDestinationRequest,
) {
  return apiClientNoThrow.call_center.transfer_destinations._destinationId(destinationId)
    .$put({ body: request })
    .then(asApiResponse<TransferDestination>)
}

export function updateSystemSettings(request: UpdateSystemSettingsRequest) {
  return apiClientNoThrow.call_center.system_settings.$put({ body: request }).then(asApiResponse<SystemSettings>)
}

export function createTestIncomingCall(request: CreateTestIncomingCallRequest) {
  return apiClientNoThrow.call_center.test_calls.$post({ body: request }).then(asApiResponse<CallRecord>)
}

export function applyCurrentCallAction(action: 'receive' | 'ai' | 'reject') {
  return apiClientNoThrow.call_center.current_call.actions._action(action).$put().then(asApiResponse<CallRecord>)
}

export function appendCurrentCallTranscript(request: AppendCurrentCallTranscriptRequest) {
  return apiClientNoThrow.call_center.current_call.transcript.$post({ body: request }).then(asApiResponse<CallRecord>)
}

export function generateAiResponse() {
  return apiClientNoThrow.call_center.current_call.ai_response.$post().then(asApiResponse<CallRecord>)
}
