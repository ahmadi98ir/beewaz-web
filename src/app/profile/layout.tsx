import { AdminSessionProvider } from '@/app/admin/session-provider'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <AdminSessionProvider>{children}</AdminSessionProvider>
}
