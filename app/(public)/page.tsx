import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart, Clock, Users, Shield, BarChart, MessageSquare } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Welcome to CareConnect
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Streamline patient care and family coordination with our comprehensive healthcare management platform
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/(public)/sign-in">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-6 text-lg">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - Bento Box Style */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Patient Care Card */}
              <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl dark:bg-gray-800/50 dark:hover:bg-gray-800/60 p-6 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-violet-100 dark:from-blue-900/20 dark:to-violet-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-blue-500/10 p-4">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Patient-Centric Care</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Keep all patient information organized and accessible in one secure place. Track medical history, medications, and care plans effortlessly.
                  </p>
                </div>
              </div>

              {/* Scheduling Card */}
              <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl dark:bg-gray-800/50 dark:hover:bg-gray-800/60 p-6 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-100 to-pink-100 dark:from-violet-900/20 dark:to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-violet-500/10 p-4">
                    <Clock className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Smart Scheduling</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Intelligent appointment management with automated reminders and conflict detection. Optimize your time and reduce no-shows.
                  </p>
                </div>
              </div>

              {/* Family Groups Card */}
              <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl dark:bg-gray-800/50 dark:hover:bg-gray-800/60 p-6 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-pink-500/10 p-4">
                    <Users className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Family Coordination</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Connect family members and caregivers seamlessly. Share updates, tasks, and important information in real-time.
                  </p>
                </div>
              </div>

              {/* Security Card */}
              <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl dark:bg-gray-800/50 dark:hover:bg-gray-800/60 p-6 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-green-500/10 p-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Enhanced Security</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    HIPAA-compliant platform with end-to-end encryption. Your data's security is our top priority.
                  </p>
                </div>
              </div>

              {/* Analytics Card */}
              <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl dark:bg-gray-800/50 dark:hover:bg-gray-800/60 p-6 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-yellow-500/10 p-4">
                    <BarChart className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Insightful Analytics</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Track trends, monitor progress, and make data-driven decisions with comprehensive analytics tools.
                  </p>
                </div>
              </div>

              {/* Communication Card */}
              <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl dark:bg-gray-800/50 dark:hover:bg-gray-800/60 p-6 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-cyan-500/10 p-4">
                    <MessageSquare className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Seamless Communication</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Built-in messaging and notification system keeps everyone in the loop and well-coordinated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              © 2024 CareConnect. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}