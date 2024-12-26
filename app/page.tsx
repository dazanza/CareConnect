import { auth } from '@clerk/nextjs/server'
import { redirect } from "next/navigation"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  ClipboardList, 
  Bell,
  ArrowRight
} from "lucide-react"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"

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
            <SignInButton mode="modal">
              <Button size="lg" className="px-8">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignInButton>
          </div>

          <BentoGrid className="mt-20">
            <BentoCard
              name="Appointment Tracking"
              className="md:col-span-1"
              Icon={Calendar}
              description="Never miss a medical appointment. Track visits across multiple doctors and set reminders for upcoming appointments."
              href="/features/appointments"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/10" />
              }
            />
            <BentoCard
              name="Family Collaboration"
              className="md:col-span-1"
              Icon={Users}
              description="Share care responsibilities with family members. Keep everyone updated on care plans and medical updates."
              href="/features/collaboration"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10" />
              }
            />
            <BentoCard
              name="Health Monitoring"
              className="md:col-span-1"
              Icon={ClipboardList}
              description="Track vital signs, medications, and symptoms over time. Spot trends and share reports with healthcare providers."
              href="/features/monitoring"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-900/10" />
              }
            />
            <BentoCard
              name="Care Timeline"
              className="md:col-span-1"
              Icon={Clock}
              description="View a complete timeline of medical events, appointments, and care notes. Keep a detailed history of your loved one's care journey."
              href="/features/timeline"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-900/10" />
              }
            />
            <BentoCard
              name="Medication Management"
              className="md:col-span-1"
              Icon={Bell}
              description="Track prescriptions, dosages, and schedules. Get reminders for medication times and refills."
              href="/features/medications"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-900/10" />
              }
            />
            <BentoCard
              name="Secure Access"
              className="md:col-span-1"
              Icon={Shield}
              description="Keep medical information private and secure. Control who has access to sensitive health data."
              href="/features/security"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/10" />
              }
            />
          </BentoGrid>
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