import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <BaseClerkProvider
      afterSignOutUrl="/sign-in"
    >
      {children}
    </BaseClerkProvider>
  )
} 