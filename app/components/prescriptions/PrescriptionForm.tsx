'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns'
import type { PrescriptionFormProps, PrescriptionFormData } from '@/app/types'
import type { Medication } from '@/app/types/medications'
import { PatientErrorBoundary } from '@/app/components/error-boundaries/PatientErrorBoundary'
import { showToast } from '@/app/lib/toast'
import { useRouter } from 'next/navigation'

export function PrescriptionForm({ 
  isOpen, 
  onClose, 
  patientId, 
  medications, 
  doctors,
  onSuccess 
}: PrescriptionFormProps) {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<PrescriptionFormData>({
    medication_id: 0,
    dosage: '',
    frequency: '',
    duration: '',
    refills: 0,
    prescribed_by: 0,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  })
  const router = useRouter()

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const { data: prescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          ...formData,
          patient_id: patientId,
          status: 'active'
        })
        .select('*, doctor:doctors(id, first_name, last_name)')
        .single()

      if (prescriptionError) throw prescriptionError

      if (prescription) {
        const { error: medicationError } = await supabase
          .from('medications')
          .update({ prescription_id: prescription.id })
          .eq('id', formData.medication_id)

        if (medicationError) throw medicationError
      }

      onClose()
      onSuccess?.()
      showToast.success('Prescription created successfully')
      router.push('/prescriptions')
      router.refresh()
    } catch (error) {
      console.error('Error creating prescription:', error)
      showToast.error('Failed to create prescription')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <PatientErrorBoundary>
          <DialogHeader>
            <DialogTitle>Add New Prescription</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select
              value={String(formData.medication_id)}
              onValueChange={(value) => setFormData({ ...formData, medication_id: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {medications.map((med) => (
                  <SelectItem key={med.id} value={String(med.id)}>
                    {med.name} ({med.dosage})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Dosage (e.g., 1 tablet)"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            />

            <Input
              placeholder="Frequency (e.g., twice daily)"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Number of refills"
              value={formData.refills}
              onChange={(e) => setFormData({ ...formData, refills: parseInt(e.target.value) })}
            />

            <Select
              value={String(formData.prescribed_by)}
              onValueChange={(value) => setFormData({ ...formData, prescribed_by: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select prescribing doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={String(doc.id)}>
                    Dr. {doc.first_name} {doc.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />

            <Textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
           </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isLoading}>Add Prescription</Button>
          </DialogFooter>
        </PatientErrorBoundary>
      </DialogContent>
    </Dialog>
  )
}