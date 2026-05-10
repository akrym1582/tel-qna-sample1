export type CallStatus =
  | '着信受付中'
  | 'オペレーター選択待ち'
  | 'AI対応中'
  | '転送中'
  | '通話終了'
  | '拒否'
  | '業務時間外終了'

export type ResponseMode = 'AI' | '人間' | '時間外'

export interface CallTranscriptLine {
  speaker: '顧客' | 'AI' | 'オペレーター' | 'システム'
  text: string
  at: string
}

export interface CallEvent {
  at: string
  type: string
  actor: string
  detail: string
}

export interface TransferHistoryItem {
  destinationId: string
  destinationName: string
  reason: string
  result: string
}

export interface CallRecord {
  id: string
  callerNumber: string
  receivedAt: string
  endedAt: string
  status: CallStatus
  responseMode: ResponseMode
  operatorName: string
  customerId: string
  customerName: string
  customerType: string
  customerSummary: string
  aiHandled: boolean
  transferRequired: boolean
  transferDestinationId?: string | null
  transferDestinationName?: string | null
  transferReason?: string | null
  aiSummary: string
  recordingLocation: string
  transcript: CallTranscriptLine[]
  events: CallEvent[]
  transferHistory: TransferHistoryItem[]
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  keywords: string[]
  enabled: boolean
  updatedAt: string
  updatedBy: string
  scoreHint: string
}

export interface TransferDestination {
  id: string
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

export interface SystemPrompt {
  id: string
  name: string
  type: string
  version: string
  content: string
  enabled: boolean
  updatedAt: string
  updatedBy: string
}

export interface SystemSettings {
  businessHours: string
  afterHoursMessage: string
  rejectMessage: string
  aiEnabled: boolean
  testLoginEnabled: boolean
  faqScoreThreshold: string
  operatorAssignmentRule: string
}

export interface CurrentOperator {
  id: string
  name: string
  role: string
  team: string
}

export interface DashboardStat {
  label: string
  value: string
}

export interface CallCenterBootstrap {
  currentOperator: CurrentOperator
  systemSettings: SystemSettings
  incomingCall: CallRecord
  callRecords: CallRecord[]
  faqItems: FaqItem[]
  transferDestinations: TransferDestination[]
  systemPrompts: SystemPrompt[]
  dashboardStats: DashboardStat[]
}

export function getCallRecord(data: CallCenterBootstrap, callId: string) {
  return [data.incomingCall, ...data.callRecords].find((callRecord) => callRecord.id === callId)
}

export function getFaqItem(data: CallCenterBootstrap, faqId: string) {
  return data.faqItems.find((faqItem) => faqItem.id === faqId)
}

export function getTransferDestination(data: CallCenterBootstrap, destinationId: string) {
  return data.transferDestinations.find((destination) => destination.id === destinationId)
}

export function getSystemPrompt(data: CallCenterBootstrap, promptId: string) {
  return data.systemPrompts.find((prompt) => prompt.id === promptId)
}
