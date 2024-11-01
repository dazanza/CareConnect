import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from "next/navigation"
import { SignInButton } from "@/app/components/auth/SigninButton"
import { ArrowRight, Calendar, Clock, Shield } from "lucide-react"

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container flex flex-col items-center justify-center px-4 py-16 mx-auto sm:py-32">
          <h1 className="text-4xl font-bold text-center sm:text-6xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Coordinated Care for Your Loved Ones
          </h1>
          <p className="mt-6 text-lg text-center text-muted-foreground max-w-2xl">
            Simplify caregiving by centralizing medical appointments, prescriptions, and care notes in one place. Stay organized and connected with everyone involved in your loved one's care journey.
          </p>
          <div className="mt-10">
            <SignInButton />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-8 mt-20 sm:grid-cols-3 max-w-4xl">
            <div className="flex flex-col items-center p-6 text-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mt-4 font-semibold">Appointment Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track all medical visits and set reminders for upcoming appointments
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold">Care Coordination</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Keep all caregivers and family members in sync with shared updates
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mt-4 font-semibold">Health Records</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Securely store and access medical history, prescriptions, and care notes
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container flex justify-center text-sm text-muted-foreground">
          © 2024 CareConnect. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
