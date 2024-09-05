import { PlusCircle, Calendar, Stethoscope } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function QuickActions() {
  return (
    <div className="flex gap-4">
      <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-md rounded-md py-3">
        <PlusCircle className="mr-2 h-5 w-5" />
        Add Patient
      </Button>
      <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-md rounded-md py-3">
        <Calendar className="mr-2 h-5 w-5" />
        Schedule
      </Button>
      <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-md rounded-md py-3">
        <Stethoscope className="mr-2 h-5 w-5" />
        Record Vitals
      </Button>
    </div>
  )
}