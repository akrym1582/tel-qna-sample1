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

vi.mock('@/lib/alert', () => ({
  alert: {
    confirm: vi.fn(),
    success: vi.fn(),
  },
}))

import { useAuth } from '@/hooks/useAuth'
import { useCallCenterData } from '@/hooks/useCallCenterData'

const mockUseAuth = vi.mocked(useAuth)
const mockUseCallCenterData = vi.mocked(useCallCenterData)

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
      incomingCall: {
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
      },
      callRecords: [],
      faqItems: [],
      transferDestinations: [],
      systemPrompts: [],
      dashboardStats: [],
    },
    isLoading: false,
    isError: false,
    message: undefined,
    mutate: vi.fn(),
  })
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

  it('AIへ回す操作で AI対応中 を表示する', async () => {
    render(
      <MemoryRouter initialEntries={['/calls/console']}>
        <CallConsolePage />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'AIへ回す' }))

    expect(screen.getByText('AI対応中')).toBeInTheDocument()
    expect(screen.getByText(/FAQ の一致候補を確認しながら自動応答を継続しています/)).toBeInTheDocument()
  })

  it('断る操作でお断りメッセージを表示する', async () => {
    render(
      <MemoryRouter initialEntries={['/calls/console']}>
        <CallConsolePage />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: '断る' }))

    expect(screen.getByText('お断り案内済み')).toBeInTheDocument()
    expect(screen.getByText('ただいま担当者が応答できないため、お電話を終了いたします。')).toBeInTheDocument()
  })
})
