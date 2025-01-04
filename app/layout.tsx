import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'
import { SupabaseAuthProvider } from './components/auth/SupabaseAuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HealthAF',
  description: 'Patient management app for caregivers and families',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseAuthProvider>
          <Providers>
            {children}
            <Toaster position="top-right" />
          </Providers>
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}
