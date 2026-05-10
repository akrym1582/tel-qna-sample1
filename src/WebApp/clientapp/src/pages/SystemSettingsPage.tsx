import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import AppShell from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { alert } from '@/lib/alert'
import { updateSystemSettings } from '@/lib/callCenterManagement'

export default function SystemSettingsPage() {
  const { data, isLoading, mutate } = useCallCenterData()
  const [businessHours, setBusinessHours] = useState('')
  const [afterHoursMessage, setAfterHoursMessage] = useState('')
  const [rejectMessage, setRejectMessage] = useState('')
  const [aiEnabled, setAiEnabled] = useState(true)
  const [testLoginEnabled, setTestLoginEnabled] = useState(true)
  const [faqScoreThreshold, setFaqScoreThreshold] = useState('')
  const [operatorAssignmentRule, setOperatorAssignmentRule] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!data) {
      return
    }

    setBusinessHours(data.systemSettings.businessHours)
    setAfterHoursMessage(data.systemSettings.afterHoursMessage)
    setRejectMessage(data.systemSettings.rejectMessage)
    setAiEnabled(data.systemSettings.aiEnabled)
    setTestLoginEnabled(data.systemSettings.testLoginEnabled)
    setFaqScoreThreshold(data.systemSettings.faqScoreThreshold)
    setOperatorAssignmentRule(data.systemSettings.operatorAssignmentRule)
  }, [data])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!data || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await alert.withLoading(() =>
        updateSystemSettings({
          businessHours,
          afterHoursMessage,
          rejectMessage,
          aiEnabled,
          testLoginEnabled,
          faqScoreThreshold,
          operatorAssignmentRule,
        }),
      )

      if (!result?.success || !result.data) {
        await alert.error(result?.message ?? 'システム設定の更新に失敗しました。')
        return
      }

      await mutate()
      await alert.success(result.message ?? 'システム設定を更新しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell title="システム設定画面" description="業務時間、AI 応答、テストログイン設定を確認できます。">
      <Card>
        <CardHeader>
          <CardTitle>システム共通設定</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">システム設定を読み込み中です。</p>
          ) : !data ? (
            <p className="text-sm text-muted-foreground">システム設定を取得できません。</p>
          ) : (
            <form className="grid gap-6 md:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="businessHours" className="text-sm font-medium">
                    業務時間
                  </label>
                  <Input
                    id="businessHours"
                    value={businessHours}
                    onChange={(event) => setBusinessHours(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="afterHoursMessage" className="text-sm font-medium">
                    業務時間外メッセージ
                  </label>
                  <textarea
                    id="afterHoursMessage"
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={afterHoursMessage}
                    onChange={(event) => setAfterHoursMessage(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="rejectMessage" className="text-sm font-medium">
                    お断りメッセージ
                  </label>
                  <textarea
                    id="rejectMessage"
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={rejectMessage}
                    onChange={(event) => setRejectMessage(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="faqScoreThreshold" className="text-sm font-medium">
                    FAQ スコア閾値
                  </label>
                  <Input
                    id="faqScoreThreshold"
                    value={faqScoreThreshold}
                    onChange={(event) => setFaqScoreThreshold(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="operatorAssignmentRule" className="text-sm font-medium">
                    割当ルール
                  </label>
                  <textarea
                    id="operatorAssignmentRule"
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={operatorAssignmentRule}
                    onChange={(event) => setOperatorAssignmentRule(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="aiEnabled" className="text-sm font-medium">
                    AI 応答
                  </label>
                  <select
                    id="aiEnabled"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={aiEnabled ? 'enabled' : 'disabled'}
                    onChange={(event) => setAiEnabled(event.target.value === 'enabled')}
                  >
                    <option value="enabled">有効</option>
                    <option value="disabled">無効</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="testLoginEnabled" className="text-sm font-medium">
                    テストログイン
                  </label>
                  <select
                    id="testLoginEnabled"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={testLoginEnabled ? 'enabled' : 'disabled'}
                    onChange={(event) => setTestLoginEnabled(event.target.value === 'enabled')}
                  >
                    <option value="enabled">有効</option>
                    <option value="disabled">無効</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '保存中...' : '保存'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AppShell>
  )
}
