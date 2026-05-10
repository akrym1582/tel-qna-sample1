import { Link, useParams } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { getCallRecord } from '@/lib/callCenterData'
import { cn } from '@/lib/utils'

export default function CallDetailPage() {
  const { callId = '' } = useParams()
  const { data, isLoading } = useCallCenterData()
  const callRecord = data ? getCallRecord(data, callId) : undefined

  if (isLoading) {
    return (
      <AppShell title="コール詳細画面" description="通話単位の詳細情報、文字起こし、AI サマリ、転送履歴を確認できます。">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">通話詳細を読み込み中です。</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  if (!callRecord) {
    return (
      <AppShell title="コール詳細画面" description="指定した通話が見つかりません。">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">対象の通話詳細を表示できません。</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="コール詳細画面"
      description="通話単位の詳細情報、文字起こし、AI サマリ、転送履歴を確認できます。"
      actions={
        <Link to="/calls" className={cn(buttonVariants({ variant: 'outline' }))}>
          一覧へ戻る
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">通話ID</p>
              <p className="font-medium">{callRecord.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">発信元電話番号</p>
              <p className="font-medium">{callRecord.callerNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">開始時刻</p>
              <p className="font-medium">{callRecord.receivedAt}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">終了時刻</p>
              <p className="font-medium">{callRecord.endedAt || '通話中'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">通話状態</p>
              <p className="font-medium">{callRecord.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">応答方式</p>
              <p className="font-medium">{callRecord.responseMode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">対応者</p>
              <p className="font-medium">{callRecord.operatorName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">録音データ参照先</p>
              <p className="font-medium break-all">{callRecord.recordingLocation}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>顧客情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-medium">顧客ID:</span> {callRecord.customerId}
            </p>
            <p>
              <span className="font-medium">顧客名:</span> {callRecord.customerName}
            </p>
            <p>
              <span className="font-medium">顧客種別:</span> {callRecord.customerType}
            </p>
            <p>
              <span className="font-medium">顧客要約:</span> {callRecord.customerSummary}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>文字起こし全文</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {callRecord.transcript.map((line) => (
              <div key={`${line.at}-${line.text}`} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{line.speaker}</span>
                  <span className="text-xs text-muted-foreground">{line.at}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{line.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI サマリ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{callRecord.aiSummary}</p>
              <p>
                <span className="font-medium">転送有無:</span> {callRecord.transferRequired ? 'あり' : 'なし'}
              </p>
              <p>
                <span className="font-medium">転送先:</span> {callRecord.transferDestinationName ?? 'なし'}
              </p>
              <p>
                <span className="font-medium">転送理由:</span> {callRecord.transferReason ?? 'なし'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>転送履歴</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {callRecord.transferHistory.length > 0 ? (
                callRecord.transferHistory.map((transfer) => (
                  <div key={transfer.destinationId} className="rounded-lg border p-3">
                    <p className="font-medium">{transfer.destinationName}</p>
                    <p className="text-muted-foreground">理由: {transfer.reason}</p>
                    <p className="text-muted-foreground">結果: {transfer.result}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">転送履歴はありません。</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>イベント履歴</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {callRecord.events.map((event) => (
                <div key={`${event.at}-${event.type}`} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{event.type}</span>
                    <span className="text-xs text-muted-foreground">{event.at}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">実行者: {event.actor}</p>
                  <p className="text-muted-foreground">{event.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
