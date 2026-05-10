import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import api from '@/api/$api'
import type { TestLoginUserDto } from '@/hooks/useAuth'
import { useAuth } from '@/hooks/useAuth'
import { alert } from '@/lib/alert'
import { asApiResponse } from '@/lib/apiResponse'
import { aspidaClientNoThrow } from '@/lib/aspida'
import { notifyInitialPassword } from '@/lib/password'
import { APP_NAME } from '@/lib/appConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const authApi = api(aspidaClientNoThrow).api.Auth

export default function LoginPage() {
  const { login, testLogin, resetPasswordByCredentials } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [testLoginUsers, setTestLoginUsers] = useState<TestLoginUserDto[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadTestLoginUsers = async () => {
      const result = await authApi.test_users.get()

      if (!result.originalResponse.ok) {
        return
      }

      const response = asApiResponse<TestLoginUserDto[]>(result.body)
      if (isMounted && response.success) {
        setTestLoginUsers(response.data ?? [])
      }
    }

    void loadTestLoginUsers().catch(() => {
      if (isMounted) {
        setTestLoginUsers([])
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await alert.withLoading(() => login(email, password))
      if (result && !result.success) {
        await alert.error(result.message ?? 'ログインに失敗しました。')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestLogin = async (userId: string) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await alert.withLoading(() => testLogin(userId))
      if (result && !result.success) {
        await alert.error(result.message ?? 'テストログインに失敗しました。')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await alert.withLoading(() => resetPasswordByCredentials(email, password))
      if (result && !result.success) {
        await alert.error(result.message ?? 'パスワードの初期化に失敗しました。')
        return
      }

      await notifyInitialPassword(
        result?.data?.initialPassword,
        '初期パスワードをクリップボードにコピーしました。再ログイン後に変更してください。',
        'パスワードを初期化しました。初期パスワードは設定値 UserManagement:InitialPassword を確認してください。',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-muted/30 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>ログイン</CardTitle>
              <CardDescription>メールアドレスとパスワードでログインしてください。</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    メールアドレス
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    パスワード
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'ログイン中...' : 'ログイン'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={() => void handleResetPassword()}
                >
                  現在のパスワードで初期化
                </Button>
                <p className="text-xs text-muted-foreground">
                  ログイン画面からの初期化では、メールアドレスと現在のパスワードの入力が必要です。
                </p>
              </form>

              {testLoginUsers.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">テストログイン</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {testLoginUsers.map((user) => (
                      <Button
                        key={user.userId}
                        type="button"
                        variant="secondary"
                        className="w-full justify-between"
                        disabled={isSubmitting}
                        onClick={() => void handleTestLogin(user.userId)}
                      >
                        <span>{user.userId}</span>
                        <span className="text-xs text-muted-foreground">{user.roles.join(', ')}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">または</span>
                  </div>
                </div>
                <Button variant="outline" className="mt-4 w-full" disabled>
                  Azure Entra ID でログイン
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden border-l bg-background px-10 py-12 lg:flex lg:flex-col lg:justify-center">
        <div className="max-w-xl space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">{APP_NAME}</p>
            <h1 className="text-4xl font-semibold leading-tight">代表電話の一次受付を、Web と AI で一元管理します。</h1>
            <p className="text-base text-muted-foreground">
              オペレーター待受、AI 自動応答、FAQ 参照、転送先選定、通話履歴確認までを初期フェーズ向けに 1 つの Web アプリで確認できます。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-muted/40 p-5">
              <p className="text-sm text-muted-foreground">最低限の提供画面</p>
              <p className="mt-2 font-medium">コール画面 / コール一覧 / 詳細 / FAQ / 転送先 / プロンプト / 設定</p>
            </div>
            <div className="rounded-xl border bg-muted/40 p-5">
              <p className="text-sm text-muted-foreground">想定ユースケース</p>
              <p className="mt-2 font-medium">着信受付、AI 応答切替、FAQ 回答、転送判断、要約確認</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
