import { renderHook, waitFor } from '@testing-library/react'
import { useApi } from '@/hooks/useApi'

const createGetApi = <T>(mockGet: ReturnType<typeof vi.fn>) => ({
  $get: mockGet as (_option?: object) => Promise<T>,
  $path: vi.fn(() => '/mock-endpoint'),
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useApi', () => {
  it('データを正常に取得する', async () => {
    const mockData = { id: 1, name: 'テスト' }
    const mockGet = vi.fn().mockResolvedValue(mockData)
    const endpoint = createGetApi<typeof mockData>(mockGet)

    const { result } = renderHook(() => useApi<typeof mockData>(endpoint))

    await waitFor(() => expect(result.current.data).toEqual(mockData))
    expect(mockGet).toHaveBeenCalled()
  })

  it('HTTP エラー時に error がセットされる', async () => {
    const mockGet = vi.fn().mockRejectedValue(new Error('not found'))
    const endpoint = createGetApi<unknown>(mockGet)

    const { result } = renderHook(() => useApi<unknown>(endpoint))

    await waitFor(() => expect(mockGet).toHaveBeenCalled())
    expect(result.current.data).toBeUndefined()
  })

  it('endpoint が null の場合はフェッチしない', async () => {
    const { result } = renderHook(() => useApi<unknown>(null))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBeUndefined()
  })

  it('初期状態では isLoading が true', () => {
    const mockGet = vi.fn().mockReturnValue(new Promise(() => {}))
    const endpoint = createGetApi<unknown>(mockGet)

    const { result } = renderHook(() => useApi<unknown>(endpoint))

    expect(mockGet).toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })
})
