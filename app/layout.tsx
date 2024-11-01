import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import toast, { Toaster } from 'react-hot-toast';
import { Suspense } from 'react'
import { Providers } from './providers'
import AppSidebar from '@/app/components/layout/Sidebar'

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
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <main>
            <Providers>
              <SignedIn>
                <div className="flex min-h-screen">
                  <div className="w-60 shrink-0">
                    <AppSidebar />
                  </div>
                  <div className="p-4">
                    {children}
                  </div>
                </div>
              </SignedIn>
              <SignedOut>
                {children}
              </SignedOut>
            </Providers>
          </main>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}
