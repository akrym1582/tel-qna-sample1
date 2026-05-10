import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SystemSettingsPage from '@/pages/SystemSettingsPage'

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
    error: vi.fn(),
    withLoading: vi.fn(),
  },
}))

vi.mock('@/lib/callCenterManagement', () => ({
  updateSystemSettings: vi.fn(),
}))

import { useAuth } from '@/hooks/useAuth'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { alert } from '@/lib/alert'
import { updateSystemSettings } from '@/lib/callCenterManagement'

const mockUseAuth = vi.mocked(useAuth)
const mockUseCallCenterData = vi.mocked(useCallCenterData)
const mockAlert = vi.mocked(alert)
const mockUpdateSystemSettings = vi.mocked(updateSystemSettings)
const mockMutate = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({
    user: {
      userId: 'user-1',
      email: 'test@example.com',
      displayName: 'テストユーザー',
      storeCode: '001',
      storeName: '本店',
      roles: ['manager'],
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
      currentOperator: { id: 'operator-01', name: '田中 花子', role: 'オペレーター', team: '代表電話受付' },
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

describe('SystemSettingsPage', () => {
  it('保存時にシステム設定更新 API と mutate を呼び出す', async () => {
    mockUpdateSystemSettings.mockResolvedValue({
      success: true,
      data: {
        businessHours: '平日 08:00〜17:00',
        afterHoursMessage: '時間外は翌営業日におかけ直しください。',
        rejectMessage: '担当者不在のため終了します。',
        aiEnabled: false,
        testLoginEnabled: false,
        faqScoreThreshold: '0.90',
        operatorAssignmentRule: 'AI 優先で受付',
      },
      message: 'システム設定を更新しました。',
    })

    render(
      <MemoryRouter>
        <SystemSettingsPage />
      </MemoryRouter>,
    )

    await userEvent.clear(screen.getByLabelText('業務時間'))
    await userEvent.type(screen.getByLabelText('業務時間'), '平日 08:00〜17:00')
    await userEvent.clear(screen.getByLabelText('FAQ スコア閾値'))
    await userEvent.type(screen.getByLabelText('FAQ スコア閾値'), '0.90')
    await userEvent.selectOptions(screen.getByLabelText('AI 応答'), 'disabled')
    await userEvent.selectOptions(screen.getByLabelText('テストログイン'), 'disabled')
    await userEvent.clear(screen.getByLabelText('割当ルール'))
    await userEvent.type(screen.getByLabelText('割当ルール'), 'AI 優先で受付')
    await userEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => {
      expect(mockUpdateSystemSettings).toHaveBeenCalledWith({
        businessHours: '平日 08:00〜17:00',
        afterHoursMessage: '営業時間外のため、本日は応答できません。',
        rejectMessage: 'ただいま担当者が応答できないため、お電話を終了いたします。',
        aiEnabled: false,
        testLoginEnabled: false,
        faqScoreThreshold: '0.90',
        operatorAssignmentRule: 'AI 優先で受付',
      })
      expect(mockMutate).toHaveBeenCalled()
      expect(mockAlert.success).toHaveBeenCalledWith('システム設定を更新しました。')
    })
  })
})
