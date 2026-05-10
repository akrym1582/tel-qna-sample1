import { Link, useParams } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFaqItem } from '@/lib/callCenterData'
import { cn } from '@/lib/utils'

export default function FaqDetailPage() {
  const { faqId = '' } = useParams()
  const faqItem = getFaqItem(faqId)

  if (!faqItem) {
    return (
      <AppShell title="FAQ詳細画面" description="指定した FAQ が見つかりません。">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">対象の FAQ 詳細を表示できません。</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="FAQ詳細画面"
      description="FAQ の回答内容、カテゴリ、検索ヒントを確認できます。"
      actions={
        <Link to="/faqs" className={cn(buttonVariants({ variant: 'outline' }))}>
          一覧へ戻る
        </Link>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>{faqItem.question}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">FAQ ID</p>
              <p className="font-medium">{faqItem.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">カテゴリ</p>
              <p className="font-medium">{faqItem.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">キーワード</p>
              <p className="font-medium">{faqItem.keywords.join(' / ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">利用可否</p>
              <p className="font-medium">{faqItem.enabled ? '有効' : '無効'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">回答</p>
              <p className="font-medium">{faqItem.answer}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">検索スコア目安</p>
              <p className="font-medium">{faqItem.scoreHint}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">更新情報</p>
              <p className="font-medium">
                {faqItem.updatedAt} / {faqItem.updatedBy}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
