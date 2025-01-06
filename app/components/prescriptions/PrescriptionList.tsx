import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pill, Calendar, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface PrescriptionListProps {
  prescriptions: any[]
  showPatient?: boolean
}

export function PrescriptionList({ 
  prescriptions,
  showPatient = false
}: PrescriptionListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Prescriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-4">
                <Pill className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/prescriptions/${prescription.id}`}
                      className="font-medium hover:underline"
                    >
                      {prescription.medication}
                    </Link>
                    <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                      {prescription.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1 mt-1">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {prescription.dosage} • {prescription.frequency}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(prescription.start_date), 'MMM d, yyyy')}
                      {prescription.end_date && ` - ${format(new Date(prescription.end_date), 'MMM d, yyyy')}`}
                    </p>
                    {prescription.notes && (
                      <p className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {prescription.notes}
                      </p>
                    )}
                    {showPatient && prescription.patient && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Patient: {prescription.patient.nickname || `${prescription.patient.first_name} ${prescription.patient.last_name}`}
                      </p>
                    )}
                    {prescription.doctor && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Prescribed by Dr. {prescription.doctor.first_name} {prescription.doctor.last_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {prescriptions.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No prescriptions found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}