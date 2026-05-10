import { Link, useParams } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSystemPrompt } from '@/lib/callCenterData'
import { cn } from '@/lib/utils'

export default function SystemPromptDetailPage() {
  const { promptId = '' } = useParams()
  const prompt = getSystemPrompt(promptId)

  if (!prompt) {
    return (
      <AppShell title="システムプロンプト詳細画面" description="指定したプロンプトが見つかりません。">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">対象のプロンプト詳細を表示できません。</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="システムプロンプト詳細画面"
      description="AI 応答に利用するプロンプト内容とバージョン情報を確認できます。"
      actions={
        <Link to="/system-prompts" className={cn(buttonVariants({ variant: 'outline' }))}>
          一覧へ戻る
        </Link>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>{prompt.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">プロンプトID</p>
            <p className="font-medium">{prompt.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">種別</p>
            <p className="font-medium">{prompt.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">バージョン</p>
            <p className="font-medium">{prompt.version}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">有効/無効</p>
            <p className="font-medium">{prompt.enabled ? '有効' : '無効'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">内容</p>
            <p className="font-medium">{prompt.content}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">更新者</p>
            <p className="font-medium">{prompt.updatedBy}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">更新日時</p>
            <p className="font-medium">{prompt.updatedAt}</p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
