import { Link, useParams } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { getTransferDestination } from '@/lib/callCenterData'
import { cn } from '@/lib/utils'

export default function TransferDestinationDetailPage() {
  const { destinationId = '' } = useParams()
  const { data, isLoading } = useCallCenterData()
  const destination = data ? getTransferDestination(data, destinationId) : undefined

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
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">転送先ID</p>
            <p className="font-medium">{destination.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">部署</p>
            <p className="font-medium">{destination.department}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">種別</p>
            <p className="font-medium">{destination.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">電話番号または識別子</p>
            <p className="font-medium">{destination.target}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">営業時間</p>
            <p className="font-medium">{destination.businessHours}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">優先度</p>
            <p className="font-medium">{destination.priority}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ヒント情報</p>
            <p className="font-medium">{destination.hint}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">フォールバック先</p>
            <p className="font-medium">{destination.fallbackName}</p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
