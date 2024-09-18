import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link href="/patients/add">
        <Button className="w-full">Add Patient</Button>
      </Link>
      <Link href="/appointments/add">
        <Button className="w-full">Schedule Appointment</Button>
      </Link>
    </div>
  )
}