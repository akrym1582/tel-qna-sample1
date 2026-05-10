import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { callRecords } from '@/lib/callCenterData'
import { cn } from '@/lib/utils'

export default function CallListPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [modeFilter, setModeFilter] = useState('all')

  const filteredCalls = useMemo(() => {
    return callRecords.filter((callRecord) => {
      const statusMatched = statusFilter === 'all' || callRecord.status === statusFilter
      const modeMatched = modeFilter === 'all' || callRecord.responseMode === modeFilter
      return statusMatched && modeMatched
    })
  }, [modeFilter, statusFilter])

  return (
    <AppShell
      title="コール一覧画面"
      description="通話一覧を状態・応答方式ごとに確認できます。"
      actions={
        <Link to="/calls/console" className={cn(buttonVariants({ variant: 'outline' }))}>
          コール画面へ
        </Link>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>通話一覧</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="statusFilter" className="text-sm font-medium">
                通話状態
              </label>
              <select
                id="statusFilter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">すべて</option>
                <option value="転送中">転送中</option>
                <option value="通話終了">通話終了</option>
                <option value="業務時間外終了">業務時間外終了</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="modeFilter" className="text-sm font-medium">
                応答方式
              </label>
              <select
                id="modeFilter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={modeFilter}
                onChange={(event) => setModeFilter(event.target.value)}
              >
                <option value="all">すべて</option>
                <option value="AI">AI</option>
                <option value="時間外">時間外</option>
                <option value="人間">人間</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-3">通話ID</th>
                  <th className="px-3 py-3">日時</th>
                  <th className="px-3 py-3">顧客</th>
                  <th className="px-3 py-3">状態</th>
                  <th className="px-3 py-3">応答方式</th>
                  <th className="px-3 py-3">対応者</th>
                  <th className="px-3 py-3">詳細</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.map((callRecord) => (
                  <tr key={callRecord.id} className="border-t">
                    <td className="px-3 py-3 font-medium">{callRecord.id}</td>
                    <td className="px-3 py-3">{callRecord.receivedAt}</td>
                    <td className="px-3 py-3">
                      <div>{callRecord.customerName}</div>
                      <div className="text-xs text-muted-foreground">{callRecord.callerNumber}</div>
                    </td>
                    <td className="px-3 py-3">{callRecord.status}</td>
                    <td className="px-3 py-3">{callRecord.responseMode}</td>
                    <td className="px-3 py-3">{callRecord.operatorName}</td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/calls/${callRecord.id}`}
                        className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
