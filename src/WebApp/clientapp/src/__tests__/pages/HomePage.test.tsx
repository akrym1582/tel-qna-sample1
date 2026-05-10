import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'

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
import { alert } from '@/lib/alert'

const mockUseAuth = vi.mocked(useAuth)
const mockUseCallCenterData = vi.mocked(useCallCenterData)
const mockAlert = vi.mocked(alert)
const mockLogout = vi.fn()

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
    logout: mockLogout,
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
        rejectMessage: 'お電話を終了いたします。',
        aiEnabled: true,
        testLoginEnabled: true,
        faqScoreThreshold: '0.82',
        operatorAssignmentRule: '先着応答 + 20秒未応答で AI へ自動切替',
      },
      incomingCall: {
        id: 'CALL-001',
        callerNumber: '03-0000-0000',
        receivedAt: '2026-05-10 10:00',
        endedAt: '',
        status: 'オペレーター選択待ち',
        responseMode: 'AI',
        operatorName: '田中 花子',
        customerId: 'CUS-001',
        customerName: '株式会社青葉商事',
        customerType: '法人',
        customerSummary: '既存顧客',
        aiHandled: true,
        transferRequired: false,
        aiSummary: 'AI 対応中',
        recordingLocation: '未保存',
        transcript: [],
        events: [],
        transferHistory: [],
      },
      callRecords: [],
      faqItems: [],
      transferDestinations: [],
      systemPrompts: [],
      dashboardStats: [
        { label: '本日の着信件数', value: '18件' },
        { label: 'AI 対応件数', value: '11件' },
      ],
    },
    isLoading: false,
    isError: false,
    message: undefined,
    mutate: vi.fn(),
  })
})

describe('HomePage', () => {
  it('ダッシュボード画面のタイトルを表示する', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('ダッシュボード画面')).toBeInTheDocument()
    expect(screen.getByText('本日の着信件数')).toBeInTheDocument()
    expect(screen.getByText('18件')).toBeInTheDocument()
  })

  it('主要メニューの導線を表示する', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /コール画面を開く/i })).toHaveAttribute('href', '/calls/console')
    expect(screen.getByRole('link', { name: /FAQ を確認する/i })).toHaveAttribute('href', '/faqs')
  })

  it('ログアウト確認後に logout を呼び出す', async () => {
    mockAlert.confirm.mockResolvedValue(true)
    mockAlert.success.mockResolvedValue(undefined as never)
    mockLogout.mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'ログアウト' }))

    await waitFor(() => {
      expect(mockAlert.confirm).toHaveBeenCalledWith('ログアウトしますか？')
      expect(mockLogout).toHaveBeenCalled()
      expect(mockAlert.success).toHaveBeenCalledWith('ログアウトしました。')
    })
  })
})
