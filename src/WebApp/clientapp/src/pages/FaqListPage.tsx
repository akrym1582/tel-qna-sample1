import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { faqItems } from '@/lib/callCenterData'
import { cn } from '@/lib/utils'

export default function FaqListPage() {
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredFaqs = useMemo(() => {
    return faqItems.filter((faqItem) => categoryFilter === 'all' || faqItem.category === categoryFilter)
  }, [categoryFilter])

  return (
    <AppShell title="FAQ一覧画面" description="AI 応答に利用する FAQ を一覧表示します。">
      <Card>
        <CardHeader>
          <CardTitle>FAQ 一覧</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="faqCategory" className="text-sm font-medium">
              カテゴリ
            </label>
            <select
              id="faqCategory"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">すべて</option>
              {[...new Set(faqItems.map((faqItem) => faqItem.category))].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4">
            {filteredFaqs.map((faqItem) => (
              <div key={faqItem.id} className="rounded-xl border bg-background p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{faqItem.id}</p>
                    <h3 className="mt-1 font-medium">{faqItem.question}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">カテゴリ: {faqItem.category}</p>
                    <p className="mt-1 text-sm text-muted-foreground">キーワード: {faqItem.keywords.join(' / ')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('rounded-full px-3 py-1 text-xs font-medium', faqItem.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-secondary text-secondary-foreground')}>
                      {faqItem.enabled ? '有効' : '無効'}
                    </span>
                    <Link to={`/faqs/${faqItem.id}`} className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}>
                      詳細
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
