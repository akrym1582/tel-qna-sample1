import { Link } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { cn } from '@/lib/utils'

export default function TransferDestinationListPage() {
  const { data, isLoading } = useCallCenterData()

  return (
    <AppShell title="転送先一覧画面" description="AI が参照する転送先マスタを確認できます。">
      <Card>
        <CardHeader>
          <CardTitle>転送先マスタ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">転送先マスタを読み込み中です。</p>
          ) : !data ? (
            <p className="text-sm text-muted-foreground">転送先マスタを取得できません。</p>
          ) : (
            data.transferDestinations.map((destination) => (
              <div key={destination.id} className="rounded-xl border bg-background p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{destination.id}</p>
                    <h3 className="mt-1 font-medium">{destination.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {destination.department} / {destination.type}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">ヒント: {destination.hint}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium',
                        destination.enabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-secondary text-secondary-foreground',
                      )}
                    >
                      {destination.enabled ? '有効' : '無効'}
                    </span>
                    <Link
                      to={`/transfer-destinations/${destination.id}`}
                      className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AppShell>
  )
}
