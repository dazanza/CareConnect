import Link from 'next/link'

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link href="/patients/add" className="bg-blue-500 text-white p-4 rounded text-center">
        Add Patient
      </Link>
      {/* Add other quick actions here */}
    </div>
  )
}