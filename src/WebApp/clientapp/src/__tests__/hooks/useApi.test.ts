import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { useApi } from '@/hooks/useApi'
import { apiClient } from '@/lib/apiClient'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const endpoint = apiClient.call_center.bootstrap
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map(), dedupingInterval: 0 } }, children)

afterEach(() => {
  vi.clearAllMocks()
})

describe('useApi', () => {
  it('データを正常に取得する', async () => {
    const mockData = { id: 1, name: 'テスト' }
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue(mockData),
    })

    const { result } = renderHook(() => useApi<typeof mockData>(endpoint as never), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(mockData))
    expect(mockFetch).toHaveBeenCalledWith(
      endpoint.$path(),
      expect.objectContaining({ credentials: 'same-origin', method: 'GET' }),
    )
  })

  it('HTTP エラー時に error がセットされる', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      json: vi.fn(),
    })

    const { result } = renderHook(() => useApi<unknown>(endpoint as never), { wrapper })

    await waitFor(() => expect(result.current.error).toBeDefined())
    expect(result.current.data).toBeUndefined()
  })

  it('endpoint が null の場合はフェッチしない', async () => {
    const { result } = renderHook(() => useApi<unknown>(null), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockFetch).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })

  it('初期状態では isLoading が true', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useApi<unknown>(endpoint as never), { wrapper })

    expect(mockFetch).toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })
})
