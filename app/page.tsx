import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-800 mb-8">Welcome to CareConnect</h1>
      <Link href="/sign-in">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Sign In
        </Button>
      </Link>
    </div>
  )
}
