import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCallCenterData } from '@/hooks/useCallCenterData'
import { alert } from '@/lib/alert'
import { updateFaq } from '@/lib/callCenterManagement'
import { getFaqItem } from '@/lib/callCenterData'
import { cn } from '@/lib/utils'

export default function FaqDetailPage() {
  const { faqId = '' } = useParams()
  const { data, isLoading, mutate } = useCallCenterData()
  const faqItem = data ? getFaqItem(data, faqId) : undefined
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState('')
  const [keywordsText, setKeywordsText] = useState('')
  const [scoreHint, setScoreHint] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!faqItem) {
      return
    }

    setQuestion(faqItem.question)
    setAnswer(faqItem.answer)
    setCategory(faqItem.category)
    setKeywordsText(faqItem.keywords.join(', '))
    setScoreHint(faqItem.scoreHint)
    setEnabled(faqItem.enabled)
  }, [faqItem])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!faqItem || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await alert.withLoading(() =>
        updateFaq(faqItem.id, {
          question,
          answer,
          category,
          keywords: keywordsText
            .split(/[,、\n]/)
            .map((keyword) => keyword.trim())
            .filter((keyword) => keyword.length > 0),
          enabled,
          scoreHint,
        }),
      )

      if (!result?.success || !result.data) {
        await alert.error(result?.message ?? 'FAQ の更新に失敗しました。')
        return
      }

      await mutate()
      await alert.success(result.message ?? 'FAQ を更新しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell title="FAQ詳細画面" description="FAQ の回答内容、カテゴリ、検索ヒントを確認できます。">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">FAQ 詳細を読み込み中です。</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

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
        <CardContent>
          <form className="grid gap-6 md:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">FAQ ID</p>
                <p className="font-medium">{faqItem.id}</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="question" className="text-sm font-medium">
                  質問
                </label>
                <Input id="question" value={question} onChange={(event) => setQuestion(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  カテゴリ
                </label>
                <Input id="category" value={category} onChange={(event) => setCategory(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="keywords" className="text-sm font-medium">
                  キーワード
                </label>
                <Input
                  id="keywords"
                  value={keywordsText}
                  onChange={(event) => setKeywordsText(event.target.value)}
                  placeholder="カンマ区切りで入力"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="scoreHint" className="text-sm font-medium">
                  検索スコア目安
                </label>
                <Input id="scoreHint" value={scoreHint} onChange={(event) => setScoreHint(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="enabled" className="text-sm font-medium">
                  利用可否
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
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="answer" className="text-sm font-medium">
                  回答
                </label>
                <textarea
                  id="answer"
                  className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  required
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">更新情報</p>
                <p className="font-medium">
                  {faqItem.updatedAt} / {faqItem.updatedBy}
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '保存中...' : '保存'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  )
}
