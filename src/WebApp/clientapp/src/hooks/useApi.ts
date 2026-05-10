import useAspidaSWR from '@aspida/swr'

/** `useApi` が無効化されているときのプレースホルダーパス */
const DISABLED_PATH_PLACEHOLDER = '/__useApi_disabled__'

type GetApi<T> = {
  $get: (_option?: object) => Promise<T>
  $path: (_option?: object) => string
}

const disabledApi: GetApi<never> = {
  $get: async () => {
    throw new Error('useApi は無効化されています。')
  },
  $path: () => DISABLED_PATH_PLACEHOLDER,
}

/**
 * 指定した aspida GET API を呼び出し、レスポンスデータを SWR でキャッシュ管理するフック。
 * `endpoint` に `null` を渡すとフェッチを無効化できる。
 * @template T - レスポンスデータの型
 * @param endpoint - フェッチ対象の aspida API。`null` を指定するとフェッチを無効化する
 * @returns SWR の戻り値（`data`・`error`・`isLoading` など）
 */
export function useApi<T>(endpoint: GetApi<T> | null) {
  const option = endpoint === null ? { key: null } : undefined

  return useAspidaSWR(endpoint ?? disabledApi, option)
}
