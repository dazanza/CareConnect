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
import { toast } from "react-hot-toast"
import { format } from 'date-fns'
import type { PrescriptionFormProps, PrescriptionFormData } from '@/app/types'

export function PrescriptionForm({ 
  isOpen, 
  onClose, 
  patientId, 
  medications, 
  doctors,
  onSuccess 
}: PrescriptionFormProps) {
  const { supabase } = useSupabase()
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

  const handleSubmit = async () => {
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
      toast.success('Prescription added successfully')
    } catch (error) {
      console.error('Error adding prescription:', error)
      toast.error('Failed to add prescription')
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Prescription</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select
            value={String(formData.medication_id)} // Convert to string
            onValueChange={(value) => setFormData({ ...formData, medication_id: Number(value) })} // Convert back to number
          >
            <SelectTrigger>
              <SelectValue placeholder="Select medication" />
            </SelectTrigger>
            <SelectContent>
              {medications.map((med) => (
                <SelectItem key={med.id} value={String(med.id)}> {/* Convert to string */}
                  {med.name} ({med.strength})
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
            value={String(formData.prescribed_by)} // Convert to string
            onValueChange={(value) => setFormData({ ...formData, prescribed_by: Number(value) })} // Convert back to number
          >
            <SelectTrigger>
              <SelectValue placeholder="Select prescribing doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doc) => (
                <SelectItem key={doc.id} value={String(doc.id)}> {/* Convert to string */}
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
          <Button onClick={handleSubmit}>Add Prescription</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}