import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CallConsolePage from '@/pages/CallConsolePage'

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

const mockUseAuth = vi.mocked(useAuth)

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
})

describe('CallConsolePage', () => {
  it('着信中の顧客情報と文字起こしを表示する', () => {
    render(
      <MemoryRouter>
        <CallConsolePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('コール画面')).toBeInTheDocument()
    expect(screen.getByText('有限会社みなと設備')).toBeInTheDocument()
    expect(screen.getByText('設備アラートが止まらず困っています。')).toBeInTheDocument()
  })

  it('AIへ回す操作で AI対応中 を表示する', async () => {
    render(
      <MemoryRouter>
        <CallConsolePage />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'AIへ回す' }))

    expect(screen.getByText('AI対応中')).toBeInTheDocument()
    expect(screen.getByText(/FAQ の一致候補を確認しながら自動応答を継続しています/)).toBeInTheDocument()
  })

  it('断る操作でお断りメッセージを表示する', async () => {
    render(
      <MemoryRouter>
        <CallConsolePage />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: '断る' }))

    expect(screen.getByText('お断り案内済み')).toBeInTheDocument()
    expect(screen.getByText('ただいま担当者が応答できないため、お電話を終了いたします。')).toBeInTheDocument()
  })
})
