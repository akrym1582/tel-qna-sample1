import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { cn } from '@/lib/utils'

type ConsoleState = 'waiting' | 'incoming' | 'ai' | 'rejected'

const statusClasses: Record<ConsoleState, string> = {
  waiting: 'bg-secondary text-secondary-foreground',
  incoming: 'bg-amber-100 text-amber-800',
  ai: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

const statusLabels: Record<ConsoleState, string> = {
  waiting: '待受中',
  incoming: 'オペレーター選択待ち',
  ai: 'AI対応中',
  rejected: 'お断り案内済み',
}

export default function CallConsolePage() {
  const { data, isLoading } = useCallCenterData()
  const [consoleState, setConsoleState] = useState<ConsoleState>('incoming')

  if (isLoading) {
    return (
      <AppShell
        title="コール画面"
        description="着信受付、AI 応答状態、リアルタイム文字起こしを 1 画面で確認できます。"
      >
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">コール画面のデータを読み込み中です。</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  if (!data) {
    return (
      <AppShell
        title="コール画面"
        description="着信受付、AI 応答状態、リアルタイム文字起こしを 1 画面で確認できます。"
      >
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">コール画面のデータを取得できません。</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  const incomingCall = data.incomingCall

  const currentMessage =
    consoleState === 'rejected'
      ? data.systemSettings.rejectMessage
      : consoleState === 'ai'
        ? 'FAQ の一致候補を確認しながら自動応答を継続しています。必要に応じて転送先候補を提示します。'
        : 'オペレーターによる応答待ちです。20 秒未応答で AI 応答へ切り替える設定です。'

  return (
    <AppShell
      title="コール画面"
      description="着信受付、AI 応答状態、リアルタイム文字起こしを 1 画面で確認できます。"
      actions={
        <Link to={`/calls/${incomingCall.id}`} className={cn(buttonVariants({ variant: 'outline' }))}>
          対象通話の詳細へ
        </Link>
      }
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>現在の受付状況</CardTitle>
            <p className="text-sm text-muted-foreground">代表番号の最新着信を表示しています。</p>
          </div>
          <span className={cn('rounded-full px-3 py-1 text-sm font-medium', statusClasses[consoleState])}>
            {statusLabels[consoleState]}
          </span>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">発信元電話番号</p>
                <p className="mt-1 text-lg font-semibold">{incomingCall.callerNumber}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">着信時刻</p>
                <p className="mt-1 text-lg font-semibold">{incomingCall.receivedAt}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">顧客名</p>
                <p className="mt-1 text-lg font-semibold">{incomingCall.customerName}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">顧客種別</p>
                <p className="mt-1 text-lg font-semibold">{incomingCall.customerType}</p>
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <h3 className="font-medium">顧客情報要約</h3>
              <p className="mt-2 text-sm text-muted-foreground">{incomingCall.customerSummary}</p>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-medium">リアルタイム文字起こし</h3>
                <span className="text-xs text-muted-foreground">遅延なく表示する想定のサンプル</span>
              </div>
              <div className="mt-4 space-y-3">
                {incomingCall.transcript.map((line) => (
                  <div key={`${line.at}-${line.text}`} className="rounded-lg bg-muted/60 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{line.speaker}</span>
                      <span className="text-xs text-muted-foreground">{line.at}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{line.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-background p-4">
              <h3 className="font-medium">着信操作</h3>
              <div className="mt-4 grid gap-3">
                <Button onClick={() => setConsoleState('waiting')}>受ける</Button>
                <Button variant="secondary" onClick={() => setConsoleState('ai')}>
                  AIへ回す
                </Button>
                <Button variant="destructive" onClick={() => setConsoleState('rejected')}>
                  断る
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{currentMessage}</p>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <h3 className="font-medium">AI 応答メモ</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">FAQ 候補</dt>
                  <dd className="font-medium">保守契約中の障害受付フロー / スコア 0.80</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">転送候補</dt>
                  <dd className="font-medium">保守受付チーム（24時間）</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">転送理由</dt>
                  <dd className="font-medium">障害対応のため AI 単独で完結せず、契約確認後の専門対応が必要</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <h3 className="font-medium">業務ルール設定</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">業務時間</dt>
                  <dd className="font-medium">{data.systemSettings.businessHours}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">AI 応答</dt>
                  <dd className="font-medium">{data.systemSettings.aiEnabled ? '有効' : '無効'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">未応答時ルール</dt>
                  <dd className="font-medium">{data.systemSettings.operatorAssignmentRule}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
