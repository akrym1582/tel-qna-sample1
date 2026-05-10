import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { alert } from '@/lib/alert'
import { updateTransferDestination } from '@/lib/callCenterManagement'
import { getTransferDestination } from '@/lib/callCenterData'
import { cn } from '@/lib/utils'

export default function TransferDestinationDetailPage() {
  const { destinationId = '' } = useParams()
  const { data, isLoading, mutate } = useCallCenterData()
  const destination = data ? getTransferDestination(data, destinationId) : undefined
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [department, setDepartment] = useState('')
  const [target, setTarget] = useState('')
  const [businessHours, setBusinessHours] = useState('')
  const [priority, setPriority] = useState('1')
  const [hint, setHint] = useState('')
  const [fallbackName, setFallbackName] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!destination) {
      return
    }

    setName(destination.name)
    setType(destination.type)
    setDepartment(destination.department)
    setTarget(destination.target)
    setBusinessHours(destination.businessHours)
    setPriority(String(destination.priority))
    setHint(destination.hint)
    setFallbackName(destination.fallbackName)
    setEnabled(destination.enabled)
  }, [destination])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!destination || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await alert.withLoading(() =>
        updateTransferDestination(destination.id, {
          name,
          type,
          department,
          target,
          businessHours,
          priority: Number.parseInt(priority, 10),
          hint,
          fallbackName,
          enabled,
        }),
      )

      if (!result?.success || !result.data) {
        await alert.error(result?.message ?? '転送先の更新に失敗しました。')
        return
      }

      await mutate()
      await alert.success(result.message ?? '転送先を更新しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell title="転送先詳細画面" description="転送先の営業時間、優先度、ヒント情報、フォールバック先を確認できます。">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">転送先詳細を読み込み中です。</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  if (!destination) {
    return (
      <AppShell title="転送先詳細画面" description="指定した転送先が見つかりません。">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">対象の転送先詳細を表示できません。</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="転送先詳細画面"
      description="転送先の営業時間、優先度、ヒント情報、フォールバック先を確認できます。"
      actions={
        <Link to="/transfer-destinations" className={cn(buttonVariants({ variant: 'outline' }))}>
          一覧へ戻る
        </Link>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>{destination.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
            <div>
              <p className="text-sm text-muted-foreground">転送先ID</p>
              <p className="font-medium">{destination.id}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                名称
              </label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">
                部署
              </label>
              <Input
                id="department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                種別
              </label>
              <Input id="type" value={type} onChange={(event) => setType(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="target" className="text-sm font-medium">
                電話番号または識別子
              </label>
              <Input id="target" value={target} onChange={(event) => setTarget(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="businessHours" className="text-sm font-medium">
                営業時間
              </label>
              <Input
                id="businessHours"
                value={businessHours}
                onChange={(event) => setBusinessHours(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                優先度
              </label>
              <Input id="priority" type="number" value={priority} onChange={(event) => setPriority(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="hint" className="text-sm font-medium">
                ヒント情報
              </label>
              <textarea
                id="hint"
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={hint}
                onChange={(event) => setHint(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="fallbackName" className="text-sm font-medium">
                フォールバック先
              </label>
              <Input
                id="fallbackName"
                value={fallbackName}
                onChange={(event) => setFallbackName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="enabled" className="text-sm font-medium">
                有効/無効
              </label>
              <select
                id="enabled"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={enabled ? 'enabled' : 'disabled'}
                onChange={(event) => setEnabled(event.target.value === 'enabled')}
              >
                <option value="enabled">有効</option>
                <option value="disabled">無効</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  )
}
