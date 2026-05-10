import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TransferDestinationDetailPage from '@/pages/TransferDestinationDetailPage'

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
  updateTransferDestination: vi.fn(),
}))

import { useAuth } from '@/hooks/useAuth'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { alert } from '@/lib/alert'
import { updateTransferDestination } from '@/lib/callCenterManagement'

const mockUseAuth = vi.mocked(useAuth)
const mockUseCallCenterData = vi.mocked(useCallCenterData)
const mockAlert = vi.mocked(alert)
const mockUpdateTransferDestination = vi.mocked(updateTransferDestination)
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
      faqItems: [],
      transferDestinations: [
        {
          id: 'TR-001',
          name: '営業二課',
          type: '人間転送',
          department: '営業本部',
          target: '03-4000-1200',
          businessHours: '平日 09:00〜18:00',
          priority: 1,
          hint: '料金改定・個別見積もり',
          fallbackName: '営業一次受付',
          enabled: true,
        },
      ],
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

describe('TransferDestinationDetailPage', () => {
  it('保存時に転送先更新 API と mutate を呼び出す', async () => {
    mockUpdateTransferDestination.mockResolvedValue({
      success: true,
      data: {
        id: 'TR-001',
        name: '営業一次窓口',
        type: '人間転送',
        department: '営業本部',
        target: '03-4000-1201',
        businessHours: '平日 08:30〜17:30',
        priority: 2,
        hint: '料金改定・更新相談',
        fallbackName: '代表受付',
        enabled: true,
      },
      message: '転送先を更新しました。',
    })

    render(
      <MemoryRouter initialEntries={['/transfer-destinations/TR-001']}>
        <Routes>
          <Route path="/transfer-destinations/:destinationId" element={<TransferDestinationDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.clear(screen.getByLabelText('名称'))
    await userEvent.type(screen.getByLabelText('名称'), '営業一次窓口')
    await userEvent.clear(screen.getByLabelText('電話番号または識別子'))
    await userEvent.type(screen.getByLabelText('電話番号または識別子'), '03-4000-1201')
    await userEvent.clear(screen.getByLabelText('営業時間'))
    await userEvent.type(screen.getByLabelText('営業時間'), '平日 08:30〜17:30')
    await userEvent.clear(screen.getByLabelText('優先度'))
    await userEvent.type(screen.getByLabelText('優先度'), '2')
    await userEvent.clear(screen.getByLabelText('ヒント情報'))
    await userEvent.type(screen.getByLabelText('ヒント情報'), '料金改定・更新相談')
    await userEvent.clear(screen.getByLabelText('フォールバック先'))
    await userEvent.type(screen.getByLabelText('フォールバック先'), '代表受付')
    await userEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => {
      expect(mockUpdateTransferDestination).toHaveBeenCalledWith('TR-001', {
        name: '営業一次窓口',
        type: '人間転送',
        department: '営業本部',
        target: '03-4000-1201',
        businessHours: '平日 08:30〜17:30',
        priority: 2,
        hint: '料金改定・更新相談',
        fallbackName: '代表受付',
        enabled: true,
      })
      expect(mockMutate).toHaveBeenCalled()
      expect(mockAlert.success).toHaveBeenCalledWith('転送先を更新しました。')
    })
  })
})
