import { AdminSessionProvider } from '@/app/admin/session-provider'
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <AdminSessionProvider>{children}</AdminSessionProvider>
}