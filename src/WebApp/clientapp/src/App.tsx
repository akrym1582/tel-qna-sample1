import { useAuth } from '@/hooks/useAuth'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import ChangePasswordPage from '@/pages/ChangePasswordPage'
import CallConsolePage from '@/pages/CallConsolePage'
import CallListPage from '@/pages/CallListPage'
import CallDetailPage from '@/pages/CallDetailPage'
import FaqListPage from '@/pages/FaqListPage'
import FaqDetailPage from '@/pages/FaqDetailPage'
import TransferDestinationListPage from '@/pages/TransferDestinationListPage'
import TransferDestinationDetailPage from '@/pages/TransferDestinationDetailPage'
import SystemPromptListPage from '@/pages/SystemPromptListPage'
import SystemPromptDetailPage from '@/pages/SystemPromptDetailPage'
import SystemSettingsPage from '@/pages/SystemSettingsPage'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  if (user.mustChangePassword) {
    return <ChangePasswordPage />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/calls/console" element={<CallConsolePage />} />
      <Route path="/calls" element={<CallListPage />} />
      <Route path="/calls/:callId" element={<CallDetailPage />} />
      <Route path="/faqs" element={<FaqListPage />} />
      <Route path="/faqs/:faqId" element={<FaqDetailPage />} />
      <Route path="/transfer-destinations" element={<TransferDestinationListPage />} />
      <Route path="/transfer-destinations/:destinationId" element={<TransferDestinationDetailPage />} />
      <Route path="/system-prompts" element={<SystemPromptListPage />} />
      <Route path="/system-prompts/:promptId" element={<SystemPromptDetailPage />} />
      <Route path="/system-settings" element={<SystemSettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
