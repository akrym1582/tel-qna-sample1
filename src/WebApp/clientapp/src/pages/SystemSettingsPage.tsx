import AppShell from '@/components/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { systemSettings } from '@/lib/callCenterData'

export default function SystemSettingsPage() {
  return (
    <AppShell title="システム設定画面" description="業務時間、AI 応答、テストログイン設定を確認できます。">
      <Card>
        <CardHeader>
          <CardTitle>システム共通設定</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">業務時間</p>
              <p className="font-medium">{systemSettings.businessHours}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">業務時間外メッセージ</p>
              <p className="font-medium">{systemSettings.afterHoursMessage}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">お断りメッセージ</p>
              <p className="font-medium">{systemSettings.rejectMessage}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">AI 応答</p>
              <p className="font-medium">{systemSettings.aiEnabled ? '有効' : '無効'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">テストログイン</p>
              <p className="font-medium">{systemSettings.testLoginEnabled ? '有効' : '無効'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">FAQ スコア閾値</p>
              <p className="font-medium">{systemSettings.faqScoreThreshold}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">割当ルール</p>
              <p className="font-medium">{systemSettings.operatorAssignmentRule}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
