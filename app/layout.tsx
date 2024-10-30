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
import Link from 'next/link';
import { Suspense } from 'react'

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
          <header className="p-4 bg-white shadow-sm">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-blue-800">
                CareConnect
              </Link>
              <div>
                <Suspense fallback={<div className="w-8 h-8" />}>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                </Suspense>
              </div>
            </div>
          </header>
          <main className="container mx-auto mt-8">
            {children}
          </main>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}
