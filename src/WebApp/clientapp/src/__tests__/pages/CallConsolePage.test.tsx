import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CallConsolePage from '@/pages/CallConsolePage'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/hooks/useCallCenterData', () => ({
  useCallCenterData: vi.fn(),
}))

vi.mock('@/lib/callCenterManagement', () => ({
  appendCurrentCallTranscript: vi.fn(),
  applyCurrentCallAction: vi.fn(),
  createTestIncomingCall: vi.fn(),
  generateAiResponse: vi.fn(),
}))

vi.mock('@/lib/alert', () => ({
  alert: {
    withLoading: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}))

import { useCallCenterData } from '@/hooks/useCallCenterData'
import { useAuth } from '@/hooks/useAuth'
import { alert } from '@/lib/alert'
import type { CallRecord } from '@/lib/callCenterData'
import {
  appendCurrentCallTranscript,
  applyCurrentCallAction,
  createTestIncomingCall,
  generateAiResponse,
} from '@/lib/callCenterManagement'

const mockUseCallCenterData = vi.mocked(useCallCenterData)
const mockUseAuth = vi.mocked(useAuth)
const mockAlert = vi.mocked(alert)
const mockAppendCurrentCallTranscript = vi.mocked(appendCurrentCallTranscript)
const mockApplyCurrentCallAction = vi.mocked(applyCurrentCallAction)
const mockCreateTestIncomingCall = vi.mocked(createTestIncomingCall)
const mockGenerateAiResponse = vi.mocked(generateAiResponse)
const mockMutate = vi.fn()

const initialIncomingCall: CallRecord = {
  id: 'CALL-20260510-003',
  callerNumber: '06-2222-3333',
  receivedAt: '2026-05-10 10:15',
  endedAt: '',
  status: 'オペレーター選択待ち',
  responseMode: 'AI',
  operatorName: '田中 花子',
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
  ],
  events: [],
  transferHistory: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({
    user: {
      userId: 'user-1',
      email: 'test@example.com',
      displayName: 'テストユーザー',
      storeCode: '001',
      storeName: '本店',
      roles: ['operator'],
      isActive: true,
      mustChangePassword: false,
    },
    isLoading: false,
    isError: false,
    login: vi.fn(),
    testLogin: vi.fn(),
    entraLogin: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
    resetPassword: vi.fn(),
    resetPasswordByCredentials: vi.fn(),
  })
  mockUseCallCenterData.mockReturnValue({
    data: {
      currentOperator: {
        id: 'operator-01',
        name: '田中 花子',
        role: 'オペレーター',
        team: '代表電話受付',
      },
      systemSettings: {
        businessHours: '平日 09:00〜18:00',
        afterHoursMessage: '営業時間外のため、本日は応答できません。',
        rejectMessage: 'ただいま担当者が応答できないため、お電話を終了いたします。',
        aiEnabled: true,
        testLoginEnabled: true,
        faqScoreThreshold: '0.82',
        operatorAssignmentRule: '先着応答 + 20秒未応答で AI へ自動切替',
      },
      incomingCall: initialIncomingCall,
      callRecords: [],
      faqItems: [],
      transferDestinations: [],
      systemPrompts: [],
      dashboardStats: [],
    },
    isLoading: false,
    isError: false,
    message: undefined,
    mutate: mockMutate,
  })
  mockAlert.withLoading.mockImplementation(async (action) => await action())
  mockAlert.success.mockResolvedValue(undefined as never)
})

describe('CallConsolePage', () => {
  it('着信中の顧客情報と文字起こしを表示する', () => {
    render(
      <MemoryRouter initialEntries={['/calls/console']}>
        <CallConsolePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'コール画面' })).toBeInTheDocument()
    expect(screen.getByText('有限会社みなと設備')).toBeInTheDocument()
    expect(screen.getByText('設備アラートが止まらず困っています。')).toBeInTheDocument()
  })

  it('AIへ回す操作で更新後の状態を表示する', async () => {
    mockApplyCurrentCallAction.mockResolvedValue({
      success: true,
      data: {
        ...initialIncomingCall,
        status: 'AI対応中',
        responseMode: 'AI',
        aiSummary: 'FAQ の一致候補を確認しながら自動応答を継続しています。',
      },
    })

    render(
      <MemoryRouter initialEntries={['/calls/console']}>
        <CallConsolePage />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'AIへ回す' }))

    expect(screen.getByText('AI対応中')).toBeInTheDocument()
    expect(screen.getAllByText('FAQ の一致候補を確認しながら自動応答を継続しています。').length).toBeGreaterThan(0)
  })

  it('文字起こし追加で顧客発話を反映する', async () => {
    mockAppendCurrentCallTranscript.mockResolvedValue({
      success: true,
      message: '文字起こしを更新しました。',
      data: {
        ...initialIncomingCall,
        transcript: [
          ...initialIncomingCall.transcript,
          { speaker: '顧客', text: '保守担当へつないでください。', at: '10:15:40' },
        ],
      },
    })

    render(
      <MemoryRouter initialEntries={['/calls/console']}>
        <CallConsolePage />
      </MemoryRouter>,
    )

    await userEvent.clear(screen.getByLabelText('顧客の追加発話'))
    await userEvent.type(screen.getByLabelText('顧客の追加発話'), '保守担当へつないでください。')
    await userEvent.click(screen.getByRole('button', { name: '文字起こしに追加' }))

    expect(screen.getAllByText('保守担当へつないでください。').length).toBeGreaterThan(0)
    expect(mockAlert.success).toHaveBeenCalledWith('文字起こしを更新しました。')
  })

  it('AI応答を生成すると要約と録音先が更新される', async () => {
    mockGenerateAiResponse.mockResolvedValue({
      success: true,
      message: 'AI 応答を生成しました。',
      data: {
        ...initialIncomingCall,
        status: '転送中',
        aiSummary: '営業二課への転送が適切と判断しました。',
        transferRequired: true,
        transferDestinationName: '営業二課',
        transferReason: '個別見積もりの相談',
        recordingLocation: 'http://127.0.0.1:10000/devstoreaccount1/call-recordings/CALL-20260510-003.json',
        transcript: [...initialIncomingCall.transcript, { speaker: 'AI', text: '営業二課へおつなぎします。', at: '10:15:45' }],
      },
    })

    render(
      <MemoryRouter initialEntries={['/calls/console']}>
        <CallConsolePage />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'AI応答を生成' }))

    expect(screen.getByText('営業二課への転送が適切と判断しました。')).toBeInTheDocument()
    expect(screen.getByText('営業二課')).toBeInTheDocument()
    expect(screen.getByText(/call-recordings\/CALL-20260510-003\.json/)).toBeInTheDocument()
  })

  it('断る操作でお断りメッセージを表示する', async () => {
    mockApplyCurrentCallAction.mockResolvedValue({
      success: true,
      data: {
        ...initialIncomingCall,
        status: '拒否',
        responseMode: '人間',
        endedAt: '2026-05-10 10:20',
      },
    })

    render(
      <MemoryRouter initialEntries={['/calls/console']}>
        <CallConsolePage />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: '断る' }))

    expect(screen.getByText('お断り案内済み')).toBeInTheDocument()
    expect(screen.getByText('ただいま担当者が応答できないため、お電話を終了いたします。')).toBeInTheDocument()
  })

  it('テスト着信を作成すると表示が切り替わる', async () => {
    mockCreateTestIncomingCall.mockResolvedValue({
      success: true,
      message: 'テスト着信を作成しました。',
      data: {
        ...initialIncomingCall,
        id: 'CALL-20260510-999',
        callerNumber: '03-4000-9999',
        customerName: '新規テスト顧客',
        transcript: [{ speaker: '顧客', text: 'サービス内容を確認したいです。', at: '10:20:00' }],
      },
    })

    render(
      <MemoryRouter initialEntries={['/calls/console']}>
        <CallConsolePage />
      </MemoryRouter>,
    )

    await userEvent.clear(screen.getByLabelText('顧客名'))
    await userEvent.type(screen.getByLabelText('顧客名'), '新規テスト顧客')
    await userEvent.click(screen.getByRole('button', { name: 'テスト着信を作成' }))

    expect(screen.getByText('新規テスト顧客')).toBeInTheDocument()
    expect(screen.getAllByText('サービス内容を確認したいです。').length).toBeGreaterThan(0)
    expect(mockAlert.success).toHaveBeenCalledWith('テスト着信を作成しました。')
  })
})
