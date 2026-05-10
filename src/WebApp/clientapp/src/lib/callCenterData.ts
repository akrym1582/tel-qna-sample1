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
  transferDestinationId?: string
  transferDestinationName?: string
  transferReason?: string
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

export const currentOperator = {
  id: 'operator-01',
  name: '田中 花子',
  role: 'オペレーター',
  team: '代表電話受付',
}

export const systemSettings: SystemSettings = {
  businessHours: '平日 09:00〜18:00',
  afterHoursMessage: '営業時間外のため、本日は応答できません。明日の営業時間内におかけ直しください。',
  rejectMessage: 'ただいま担当者が応答できないため、お電話を終了いたします。',
  aiEnabled: true,
  testLoginEnabled: true,
  faqScoreThreshold: '0.82',
  operatorAssignmentRule: '先着応答 + 20秒未応答で AI へ自動切替',
}

export const callRecords: CallRecord[] = [
  {
    id: 'CALL-20260510-001',
    callerNumber: '03-1234-5678',
    receivedAt: '2026-05-10 10:02',
    endedAt: '2026-05-10 10:09',
    status: '転送中',
    responseMode: 'AI',
    operatorName: '田中 花子',
    customerId: 'CUS-001',
    customerName: '株式会社青葉商事',
    customerType: '法人',
    customerSummary: '既存顧客 / 契約プラン: プレミアム / 直近 30 日で 2 回入電',
    aiHandled: true,
    transferRequired: true,
    transferDestinationId: 'TR-001',
    transferDestinationName: '営業二課',
    transferReason: '料金改定に伴う個別見積もり相談のため営業部門へ転送',
    aiSummary: '料金改定の影響と更新条件に関する問い合わせ。FAQで概要説明後、個別条件確認のため営業二課への転送を提案。',
    recordingLocation: 'https://storage.example/calls/CALL-20260510-001.wav',
    transcript: [
      { speaker: '顧客', text: '来月更新の見積もり条件を確認したいです。', at: '10:02:11' },
      { speaker: 'AI', text: '一般的な更新条件をご案内します。個別見積もりは担当部署へおつなぎできます。', at: '10:02:26' },
      { speaker: '顧客', text: '担当部署につないでください。', at: '10:02:41' },
      { speaker: 'システム', text: '営業二課へ転送を開始しました。', at: '10:02:49' },
    ],
    events: [
      { at: '10:02:02', type: '着信受付', actor: 'ACS', detail: '代表番号への着信を受付' },
      { at: '10:02:10', type: 'AI応答開始', actor: '田中 花子', detail: 'オペレーターが AI 対応へ切替' },
      { at: '10:02:48', type: '転送判断', actor: 'AI', detail: '営業二課を候補として選定' },
      { at: '10:02:49', type: '転送実行', actor: 'システム', detail: '営業二課へ転送開始' },
    ],
    transferHistory: [
      {
        destinationId: 'TR-001',
        destinationName: '営業二課',
        reason: '個別見積もりの相談',
        result: '転送中',
      },
    ],
  },
  {
    id: 'CALL-20260510-002',
    callerNumber: '090-1111-2222',
    receivedAt: '2026-05-10 09:18',
    endedAt: '2026-05-10 09:23',
    status: '通話終了',
    responseMode: 'AI',
    operatorName: 'AI 自動応答',
    customerId: 'CUS-002',
    customerName: '山田 太郎',
    customerType: '個人',
    customerSummary: '未契約 / FAQ で解決可能な問い合わせが多い顧客',
    aiHandled: true,
    transferRequired: false,
    aiSummary: 'ログイン通知メール未着の問い合わせ。FAQ をもとに再送手順を案内し、顧客の自己解決を確認して終了。',
    recordingLocation: 'https://storage.example/calls/CALL-20260510-002.wav',
    transcript: [
      { speaker: '顧客', text: 'ログイン通知メールが届きません。', at: '09:18:14' },
      { speaker: 'AI', text: '迷惑メールフォルダの確認と再送手順をご案内します。', at: '09:18:30' },
      { speaker: '顧客', text: '再送で解決しました。', at: '09:19:02' },
    ],
    events: [
      { at: '09:18:10', type: '着信受付', actor: 'ACS', detail: '代表番号への着信を受付' },
      { at: '09:18:13', type: 'AI応答開始', actor: 'システム', detail: '未応答タイムアウトで AI へ切替' },
      { at: '09:19:05', type: '通話終了', actor: 'AI', detail: 'FAQ 回答で解決して終了' },
    ],
    transferHistory: [],
  },
  {
    id: 'CALL-20260509-014',
    callerNumber: '080-9999-0000',
    receivedAt: '2026-05-09 19:11',
    endedAt: '2026-05-09 19:12',
    status: '業務時間外終了',
    responseMode: '時間外',
    operatorName: '時間外ガイダンス',
    customerId: 'CUS-NEW',
    customerName: '未登録番号',
    customerType: '不明',
    customerSummary: '顧客未登録 / 時間外のため詳細不明',
    aiHandled: false,
    transferRequired: false,
    aiSummary: '業務時間外メッセージを再生して通話を終了。',
    recordingLocation: 'https://storage.example/calls/CALL-20260509-014.wav',
    transcript: [
      { speaker: 'システム', text: '営業時間外のため、本日は応答できません。', at: '19:11:05' },
    ],
    events: [
      { at: '19:11:02', type: '着信受付', actor: 'ACS', detail: '業務時間外着信' },
      { at: '19:11:05', type: '業務時間外終了', actor: 'システム', detail: '時間外メッセージを再生して終了' },
    ],
    transferHistory: [],
  },
]

export const incomingCall: CallRecord = {
  id: 'CALL-20260510-003',
  callerNumber: '06-2222-3333',
  receivedAt: '2026-05-10 10:15',
  endedAt: '',
  status: 'オペレーター選択待ち',
  responseMode: 'AI',
  operatorName: currentOperator.name,
  customerId: 'CUS-003',
  customerName: '有限会社みなと設備',
  customerType: '法人',
  customerSummary: '既存顧客 / 保守契約あり / 設備障害の一次受付',
  aiHandled: true,
  transferRequired: false,
  aiSummary: '保守契約の一次切り分けを行い、障害受付チームへの転送要否を判断する想定。',
  recordingLocation: '未保存',
  transcript: [
    { speaker: '顧客', text: '設備アラートが止まらず困っています。', at: '10:15:12' },
    { speaker: 'AI', text: '契約内容を確認しながら対処方法をご案内します。', at: '10:15:20' },
    { speaker: '顧客', text: '保守担当へつないでほしいです。', at: '10:15:36' },
  ],
  events: [
    { at: '10:15:01', type: '着信受付', actor: 'ACS', detail: '代表番号への着信を受付' },
    { at: '10:15:07', type: '顧客照合', actor: 'システム', detail: '電話番号から有限会社みなと設備を特定' },
  ],
  transferHistory: [],
}

export const faqItems: FaqItem[] = [
  {
    id: 'FAQ-001',
    question: 'ログイン通知メールが届かない場合の確認手順は？',
    answer: '迷惑メールフォルダの確認、受信許可設定、再送操作を案内します。5 分待っても届かない場合は担当部署へ転送します。',
    category: 'ログイン',
    keywords: ['メール未着', '再送', 'ログイン'],
    enabled: true,
    updatedAt: '2026-05-08 13:40',
    updatedBy: 'FAQ管理者',
    scoreHint: '0.94',
  },
  {
    id: 'FAQ-002',
    question: '料金改定に関する一般的な説明は？',
    answer: '改定時期、対象プラン、通知方法を案内します。個別見積もりは営業部門へ転送します。',
    category: '料金',
    keywords: ['料金改定', '見積もり', '更新'],
    enabled: true,
    updatedAt: '2026-05-07 09:15',
    updatedBy: 'FAQ管理者',
    scoreHint: '0.88',
  },
  {
    id: 'FAQ-003',
    question: '保守契約中の障害受付フローは？',
    answer: '契約番号確認後、一次切り分けを行い、重大障害は保守受付チームへ即時転送します。',
    category: '保守',
    keywords: ['障害', '保守', '一次受付'],
    enabled: false,
    updatedAt: '2026-05-01 18:05',
    updatedBy: '鈴木 一郎',
    scoreHint: '0.80',
  },
]

export const transferDestinations: TransferDestination[] = [
  {
    id: 'TR-001',
    name: '営業二課',
    type: '人間転送',
    department: '営業本部',
    target: '03-4000-1200',
    businessHours: '平日 09:00〜18:00',
    priority: 1,
    hint: '料金改定・個別見積もり・契約更新相談を優先受付',
    fallbackName: '営業一次受付',
    enabled: true,
  },
  {
    id: 'TR-002',
    name: '保守受付チーム',
    type: '人間転送',
    department: 'カスタマーサポート',
    target: '03-4000-2200',
    businessHours: '24時間',
    priority: 1,
    hint: '障害・重大インシデント・保守契約ありの顧客を優先',
    fallbackName: '夜間オンコール',
    enabled: true,
  },
  {
    id: 'TR-003',
    name: '代表折り返しキュー',
    type: 'キュー',
    department: '代表電話受付',
    target: 'QUEUE-CALLBACK',
    businessHours: '平日 09:00〜18:00',
    priority: 9,
    hint: '即時転送できない場合のフォールバック',
    fallbackName: 'なし',
    enabled: true,
  },
]

export const systemPrompts: SystemPrompt[] = [
  {
    id: 'PROMPT-001',
    name: '代表電話 AI 受付',
    type: '電話一次受付',
    version: 'v1.3',
    content: '顧客の用件を短く整理し、FAQ で回答可能な場合のみ簡潔に案内します。解決できない場合は転送先マスタのヒントと営業時間を確認して転送します。',
    enabled: true,
    updatedAt: '2026-05-09 16:20',
    updatedBy: '管理者',
  },
  {
    id: 'PROMPT-002',
    name: '時間外案内',
    type: '自動音声',
    version: 'v1.1',
    content: '現在の営業時間外であること、翌営業日の案内、緊急時の転送先がある場合の説明を丁寧に行います。',
    enabled: true,
    updatedAt: '2026-05-02 11:10',
    updatedBy: '管理者',
  },
  {
    id: 'PROMPT-003',
    name: '転送判断補助',
    type: 'ルーティング',
    version: 'v0.9',
    content: 'FAQ の一致度が閾値未満の場合は問い合わせカテゴリと顧客属性から転送先候補を優先度順に提案します。',
    enabled: false,
    updatedAt: '2026-04-28 09:05',
    updatedBy: 'スーパーバイザー',
  },
]

export function getCallRecord(callId: string) {
  return [...callRecords, incomingCall].find((callRecord) => callRecord.id === callId)
}

export function getFaqItem(faqId: string) {
  return faqItems.find((faqItem) => faqItem.id === faqId)
}

export function getTransferDestination(destinationId: string) {
  return transferDestinations.find((destination) => destination.id === destinationId)
}

export function getSystemPrompt(promptId: string) {
  return systemPrompts.find((prompt) => prompt.id === promptId)
}

export const dashboardStats = [
  { label: '本日の着信件数', value: '18件' },
  { label: 'AI 対応件数', value: '11件' },
  { label: '転送待ち件数', value: '2件' },
  { label: '未対応件数', value: '1件' },
]
