import { Link } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardStats, systemSettings } from '@/lib/callCenterData'
import { cn } from '@/lib/utils'

const quickLinks = [
  { to: '/calls/console', label: 'コール画面を開く', description: '最新着信の受付と AI 応答状態を確認します。' },
  { to: '/calls', label: 'コール一覧を見る', description: '通話履歴の一覧と詳細を確認します。' },
  { to: '/faqs', label: 'FAQ を確認する', description: 'AI が参照する回答ナレッジを確認します。' },
  { to: '/system-settings', label: 'システム設定を見る', description: '業務時間や AI 応答設定を確認します。' },
]

export default function HomePage() {
  return (
    <AppShell title="ダッシュボード画面" description="電話受付・AI 応答システムの最新状況を表示します。">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>本日の運用サマリ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">業務時間</p>
            <p className="mt-1 text-lg font-semibold">{systemSettings.businessHours}</p>
            <p className="mt-2 text-sm text-muted-foreground">AI 応答は {systemSettings.aiEnabled ? '有効' : '無効'} です。</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">未応答時ルール</p>
            <p className="mt-1 text-lg font-semibold">{systemSettings.operatorAssignmentRule}</p>
            <p className="mt-2 text-sm text-muted-foreground">時間外は自動音声で案内後に終了します。</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>主要メニュー</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className={cn(buttonVariants({ variant: 'outline' }), 'h-auto justify-start px-4 py-4')}>
              <span>
                <span className="block font-medium text-foreground">{link.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{link.description}</span>
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  )
}
