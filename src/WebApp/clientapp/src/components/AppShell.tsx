import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { alert } from '@/lib/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigationItems = [
  { to: '/', label: 'ダッシュボード', match: ['/', ''] },
  { to: '/calls/console', label: 'コール画面', match: ['/calls/console'] },
  { to: '/calls', label: 'コール一覧', match: ['/calls'] },
  { to: '/faqs', label: 'FAQ', match: ['/faqs'] },
  { to: '/transfer-destinations', label: '転送先マスタ', match: ['/transfer-destinations'] },
  { to: '/system-prompts', label: 'システムプロンプト', match: ['/system-prompts'] },
  { to: '/system-settings', label: 'システム設定', match: ['/system-settings'] },
]

interface AppShellProps {
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export default function AppShell({ title, description, actions, children }: AppShellProps) {
  const location = useLocation()
  const { logout } = useAuth()
  const { data } = useCallCenterData()
  const currentOperator = data?.currentOperator

  const handleLogout = async () => {
    const confirmed = await alert.confirm('ログアウトしますか？')
    if (!confirmed) {
      return
    }

    await logout()
    await alert.success('ログアウトしました。')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">電話受付・AI応答システム</p>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="rounded-lg border bg-card px-4 py-2 text-sm">
              <p className="font-medium">{currentOperator?.name ?? 'オペレーター情報を取得中...'}</p>
              <p className="text-muted-foreground">
                {currentOperator ? `${currentOperator.role} / ${currentOperator.team}` : '少々お待ちください'}
              </p>
            </div>
            <Button variant="outline" onClick={() => void handleLogout()}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-xl border bg-background p-3">
          <nav className="flex flex-col gap-1">
            {navigationItems.map((item) => {
              const isActive = item.match.some((prefix) =>
                prefix === '/'
                  ? location.pathname === '/'
                  : location.pathname === prefix || location.pathname.startsWith(`${prefix}/`),
              )

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="space-y-6">
          {actions ? <div className="flex flex-wrap justify-end gap-3">{actions}</div> : null}
          {children}
        </main>
      </div>
    </div>
  )
}
