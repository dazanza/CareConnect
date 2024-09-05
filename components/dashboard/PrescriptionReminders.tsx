import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface Prescription {
  id: number
  patient: string
  medication: string
  next_dose: string
}

interface PrescriptionRemindersProps {
  prescriptions: Prescription[]
}

export default function PrescriptionReminders({ prescriptions }: PrescriptionRemindersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-blue-800">Prescription Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {prescriptions.map((prescription, index) => (
            <div key={prescription.id}>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-blue-600">{prescription.patient}</p>
                  <p className="text-sm text-gray-600">{prescription.medication}</p>
                </div>
                <p className="text-sm font-medium text-gray-700">{prescription.next_dose}</p>
              </div>
              {index < prescriptions.length - 1 && <Separator />}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}