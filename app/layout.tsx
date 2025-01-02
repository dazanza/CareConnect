import { Inter } from 'next/font/google'
import './globals.css'
import toast, { Toaster } from 'react-hot-toast';
import { Suspense } from 'react'
import { Providers } from './providers'
import AppSidebar from '@/app/components/layout/Sidebar'
import Header from '@/app/components/layout/Header'
import { SupabaseProvider } from './components/auth/SupabaseProvider'
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
      <body>
        <SupabaseProvider>
          <SupabaseAuthProvider>
            <Providers>
              <div className="flex min-h-screen">
                <div className="w-60 shrink-0">
                  <AppSidebar />
                </div>
                <div className="flex-1 flex flex-col">
                  <Header />
                  <div className="p-4 flex-1">
                    {children}
                  </div>
                </div>
              </div>
              <Toaster position="top-right" />
            </Providers>
          </SupabaseAuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
