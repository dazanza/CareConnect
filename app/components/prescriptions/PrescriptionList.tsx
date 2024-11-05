import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pill, Calendar, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { toast } from "react-hot-toast"
import { useSupabase } from '@/app/hooks/useSupabase'
import { format } from 'date-fns'
import type { PrescriptionListProps, Prescription } from '@/app/types'
import { PrescriptionForm } from './PrescriptionForm'

export function PrescriptionList({ 
    patientId, 
    medications,
    doctors,
    initialPrescriptions = [] 
  }: PrescriptionListProps) {
    const { supabase } = useSupabase()
    const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions)
    const [showAddDialog, setShowAddDialog] = useState(false)
  
    const handleDelete = async (id: number) => { // Change type to number
      try {
        const { error } = await supabase
          .from('prescriptions')
          .delete()
          .eq('id', id)
  
        if (error) throw error
  
        setPrescriptions(prescriptions.filter(p => p.id !== id))
        toast.success('Prescription deleted successfully')
      } catch (error) {
        console.error('Error deleting prescription:', error)
        toast.error('Failed to delete prescription')
      }
    }

  const getStatusColor = (status: Prescription['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'discontinued': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prescriptions</CardTitle>
        <Button onClick={() => setShowAddDialog(true)} size="sm">
          <Pill className="w-4 h-4 mr-2" />
          Add Prescription
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-4">
                <Pill className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{prescription.medication}</h4>
                    <Badge variant="outline" className={getStatusColor(prescription.status)}>
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
                    {prescription.doctor && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Prescribed by Dr. {prescription.doctor.first_name} {prescription.doctor.last_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => handleDelete(prescription.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {prescriptions.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No prescriptions found</p>
          )}
        </div>

        <PrescriptionForm
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          patientId={patientId}
          medications={medications}
          doctors={doctors}
          onSuccess={() => {
            // Refresh prescriptions list
            supabase
              .from('prescriptions')
              .select('*, medication:medications(*), doctor:doctors(id, first_name, last_name)')
              .eq('patient_id', patientId)
              .order('created_at', { ascending: false })
              .then(({ data }) => {
                if (data) setPrescriptions(data)
              })
          }}
        />
      </CardContent>
    </Card>
  )
}