import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { alert } from '@/lib/alert'
import type { CallRecord } from '@/lib/callCenterData'
import { applyCurrentCallAction, createTestIncomingCall } from '@/lib/callCenterManagement'
import { cn } from '@/lib/utils'

type ConsoleState = 'waiting' | 'incoming' | 'ai' | 'rejected'

const statusClasses: Record<ConsoleState, string> = {
  waiting: 'bg-secondary text-secondary-foreground',
  incoming: 'bg-amber-100 text-amber-800',
  ai: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

const statusLabels: Record<ConsoleState, string> = {
  waiting: '着信受付中',
  incoming: 'オペレーター選択待ち',
  ai: 'AI対応中',
  rejected: 'お断り案内済み',
}

function getConsoleState(call: CallRecord): ConsoleState {
  if (call.status === '拒否') {
    return 'rejected'
  }

  if (call.status === 'AI対応中') {
    return 'ai'
  }

  if (call.status === '着信受付中') {
    return 'waiting'
  }

  return 'incoming'
}

export default function CallConsolePage() {
  const { data, isLoading, mutate } = useCallCenterData()
  const [currentCall, setCurrentCall] = useState<CallRecord>()
  const [callerNumber, setCallerNumber] = useState('03-4000-9999')
  const [customerName, setCustomerName] = useState('テスト顧客')
  const [requestedTopic, setRequestedTopic] = useState('サービス内容を確認したいです。')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setCurrentCall(data?.incomingCall)
  }, [data?.incomingCall])

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

  if (!data || !currentCall) {
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

  const consoleState = getConsoleState(currentCall)
  const currentMessage =
    consoleState === 'rejected'
      ? data.systemSettings.rejectMessage
      : consoleState === 'ai'
        ? currentCall.aiSummary
        : consoleState === 'waiting'
          ? 'オペレーターが通話を開始しています。'
          : 'オペレーターによる応答待ちです。20 秒未応答で AI 応答へ切り替える設定です。'

  const handleCallAction = async (action: 'receive' | 'ai' | 'reject') => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await alert.withLoading(() => applyCurrentCallAction(action))
      if (!result?.success || !result.data) {
        await alert.error(result?.message ?? '通話状態の更新に失敗しました。')
        return
      }

      setCurrentCall(result.data)
      await mutate()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateTestCall = async (event: FormEvent) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await alert.withLoading(() =>
        createTestIncomingCall({
          callerNumber,
          customerName,
          customerType: 'テスト',
          customerSummary: 'ブラウザから作成したテスト着信です。',
          requestedTopic,
        }),
      )

      if (!result?.success || !result.data) {
        await alert.error(result?.message ?? 'テスト着信の作成に失敗しました。')
        return
      }

      setCurrentCall(result.data)
      await mutate()
      await alert.success(result.message ?? 'テスト着信を作成しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell
      title="コール画面"
      description="着信受付、AI 応答状態、リアルタイム文字起こしを 1 画面で確認できます。"
      actions={
        <Link to={`/calls/${currentCall.id}`} className={cn(buttonVariants({ variant: 'outline' }))}>
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
                <p className="mt-1 text-lg font-semibold">{currentCall.callerNumber}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">着信時刻</p>
                <p className="mt-1 text-lg font-semibold">{currentCall.receivedAt}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">顧客名</p>
                <p className="mt-1 text-lg font-semibold">{currentCall.customerName}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">顧客種別</p>
                <p className="mt-1 text-lg font-semibold">{currentCall.customerType}</p>
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <h3 className="font-medium">顧客情報要約</h3>
              <p className="mt-2 text-sm text-muted-foreground">{currentCall.customerSummary}</p>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-medium">リアルタイム文字起こし</h3>
                <span className="text-xs text-muted-foreground">ACS webhook またはテスト着信から更新</span>
              </div>
              <div className="mt-4 space-y-3">
                {currentCall.transcript.map((line) => (
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
                <Button disabled={isSubmitting} onClick={() => void handleCallAction('receive')}>
                  受ける
                </Button>
                <Button disabled={isSubmitting} variant="secondary" onClick={() => void handleCallAction('ai')}>
                  AIへ回す
                </Button>
                <Button disabled={isSubmitting} variant="destructive" onClick={() => void handleCallAction('reject')}>
                  断る
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{currentMessage}</p>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <h3 className="font-medium">テスト着信作成</h3>
              <form className="mt-4 space-y-3" onSubmit={(event) => void handleCreateTestCall(event)}>
                <div className="space-y-2">
                  <label htmlFor="callerNumber" className="text-sm font-medium">
                    発信元電話番号
                  </label>
                  <Input id="callerNumber" value={callerNumber} onChange={(event) => setCallerNumber(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="customerName" className="text-sm font-medium">
                    顧客名
                  </label>
                  <Input id="customerName" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="requestedTopic" className="text-sm font-medium">
                    問い合わせ内容
                  </label>
                  <textarea
                    id="requestedTopic"
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={requestedTopic}
                    onChange={(event) => setRequestedTopic(event.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} variant="outline">
                  テスト着信を作成
                </Button>
              </form>
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
