import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-800 mb-8">Welcome to CareConnect</h1>
      {userId && (
        <Link href="/dashboard">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            Go to Dashboard
          </Button>
        </Link>
      )}
    </div>
  )
}
