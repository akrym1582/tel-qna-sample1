import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import FaqDetailPage from '@/pages/FaqDetailPage'

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
  updateFaq: vi.fn(),
}))

import { useAuth } from '@/hooks/useAuth'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { alert } from '@/lib/alert'
import { updateFaq } from '@/lib/callCenterManagement'

const mockUseAuth = vi.mocked(useAuth)
const mockUseCallCenterData = vi.mocked(useCallCenterData)
const mockAlert = vi.mocked(alert)
const mockUpdateFaq = vi.mocked(updateFaq)
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
        afterHoursMessage: '時間外です。',
        rejectMessage: 'お断りします。',
        aiEnabled: true,
        testLoginEnabled: true,
        faqScoreThreshold: '0.82',
        operatorAssignmentRule: '先着応答',
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
      faqItems: [
        {
          id: 'FAQ-001',
          question: '元の質問',
          answer: '元の回答',
          category: 'ログイン',
          keywords: ['メール未着', '再送'],
          enabled: true,
          updatedAt: '2026-05-08 13:40',
          updatedBy: 'FAQ管理者',
          scoreHint: '0.94',
        },
      ],
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

describe('FaqDetailPage', () => {
  it('保存時に FAQ 更新 API と mutate を呼び出す', async () => {
    mockUpdateFaq.mockResolvedValue({
      success: true,
      data: {
        id: 'FAQ-001',
        question: '更新後の質問',
        answer: '更新後の回答',
        category: 'ログイン',
        keywords: ['メール未着', '再送', '通知'],
        enabled: true,
        updatedAt: '2026-05-10 12:00',
        updatedBy: '管理者',
        scoreHint: '0.91',
      },
      message: 'FAQ を更新しました。',
    })

    render(
      <MemoryRouter initialEntries={['/faqs/FAQ-001']}>
        <Routes>
          <Route path="/faqs/:faqId" element={<FaqDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.clear(screen.getByLabelText('質問'))
    await userEvent.type(screen.getByLabelText('質問'), '更新後の質問')
    await userEvent.clear(screen.getByLabelText('回答'))
    await userEvent.type(screen.getByLabelText('回答'), '更新後の回答')
    await userEvent.clear(screen.getByLabelText('キーワード'))
    await userEvent.type(screen.getByLabelText('キーワード'), 'メール未着, 再送, 通知')
    await userEvent.clear(screen.getByLabelText('検索スコア目安'))
    await userEvent.type(screen.getByLabelText('検索スコア目安'), '0.91')
    await userEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => {
      expect(mockUpdateFaq).toHaveBeenCalledWith('FAQ-001', {
        question: '更新後の質問',
        answer: '更新後の回答',
        category: 'ログイン',
        keywords: ['メール未着', '再送', '通知'],
        enabled: true,
        scoreHint: '0.91',
      })
      expect(mockMutate).toHaveBeenCalled()
      expect(mockAlert.success).toHaveBeenCalledWith('FAQ を更新しました。')
    })
  })
})
