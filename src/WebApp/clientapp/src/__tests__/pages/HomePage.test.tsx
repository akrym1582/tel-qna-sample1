import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/alert', () => ({
  alert: {
    confirm: vi.fn(),
    success: vi.fn(),
  },
}))

import { useAuth } from '@/hooks/useAuth'
import { alert } from '@/lib/alert'

const mockUseAuth = vi.mocked(useAuth)
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
