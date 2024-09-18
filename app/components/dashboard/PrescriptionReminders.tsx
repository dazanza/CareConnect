import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Prescription } from '@/types'
import { format } from 'date-fns'

interface PrescriptionRemindersProps {
  prescriptions: Prescription[]
}

export default function PrescriptionReminders({ prescriptions }: PrescriptionRemindersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescription Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        {prescriptions.length > 0 ? (
          <ul>
            {prescriptions.map((prescription) => (
              <li key={prescription.id} className="mb-2">
                {prescription.medication} - Next dose: {format(new Date(prescription.next_dose), 'MMMM d, yyyy h:mm a')}
              </li>
            ))}
          </ul>
        ) : (
          <p>No prescription reminders</p>
        )}
      </CardContent>
    </Card>
  )
}