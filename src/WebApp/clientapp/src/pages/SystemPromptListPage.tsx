import { Link } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { cn } from '@/lib/utils'

export default function SystemPromptListPage() {
  const { data, isLoading } = useCallCenterData()

  return (
    <AppShell title="システムプロンプト一覧画面" description="AI 応答に利用するシステムプロンプトを一覧表示します。">
      <Card>
        <CardHeader>
          <CardTitle>システムプロンプト一覧</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">システムプロンプト一覧を読み込み中です。</p>
          ) : !data ? (
            <p className="text-sm text-muted-foreground">システムプロンプト一覧を取得できません。</p>
          ) : (
            data.systemPrompts.map((prompt) => (
              <div key={prompt.id} className="rounded-xl border bg-background p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{prompt.id}</p>
                    <h3 className="mt-1 font-medium">{prompt.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {prompt.type} / {prompt.version}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{prompt.content}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium',
                        prompt.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-secondary text-secondary-foreground',
                      )}
                    >
                      {prompt.enabled ? '有効' : '無効'}
                    </span>
                    <Link
                      to={`/system-prompts/${prompt.id}`}
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
