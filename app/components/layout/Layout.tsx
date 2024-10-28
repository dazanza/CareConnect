import { NotificationListener } from '@/components/notifications/NotificationListener'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NotificationListener />
      {children}
    </>
  )
}
