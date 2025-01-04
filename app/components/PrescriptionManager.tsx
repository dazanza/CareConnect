'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Pill, Plus, Calendar, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { toast } from "react-hot-toast"
import { useSupabase } from '@/app/hooks/useSupabase'
import { format, addDays } from 'date-fns'
import { Doctor, Prescription, Medication } from '@/types'

interface PrescriptionManagerProps {
  patientId: string
  doctors: Doctor[]
  initialPrescriptions: Prescription[]
}

export function PrescriptionManager({ 
  patientId, 
  doctors,
  initialPrescriptions = [] 
}: PrescriptionManagerProps) {
  const { supabase } = useSupabase()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions)
  const [showAddPrescription, setShowAddPrescription] = useState(false)
  const [newPrescription, setNewPrescription] = useState({
    medication_id: 0,
    medication: '',
    dosage: '',
    frequency: '',
    duration: 0,
    refills: 0,
    prescribed_by: 0,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  })

  const handleAddPrescription = async () => {
    if (!supabase) return

    try {
      const endDate = addDays(new Date(newPrescription.start_date), newPrescription.duration)
      
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          medication_id: newPrescription.medication_id,
          medication: newPrescription.medication,
          dosage: newPrescription.dosage,
          frequency: newPrescription.frequency,
          duration: newPrescription.duration,
          refills: newPrescription.refills,
          prescribed_by: newPrescription.prescribed_by,
          patient_id: parseInt(patientId),
          start_date: newPrescription.start_date,
          end_date: format(endDate, 'yyyy-MM-dd'),
          notes: newPrescription.notes,
          status: 'active'
        })
        .select('*, doctor:doctors(id, first_name, last_name)')
        .single()

      if (error) throw error

      setPrescriptions([data, ...prescriptions])
      setShowAddPrescription(false)
      setNewPrescription({
        medication_id: 0,
        medication: '',
        dosage: '',
        frequency: '',
        duration: 0,
        refills: 0,
        prescribed_by: 0,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
      })
      toast.success('Prescription added successfully')
    } catch (error) {
      console.error('Error adding prescription:', error)
      toast.error('Failed to add prescription')
    }
  }

  const handleDelete = async (id: number) => {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prescriptions</CardTitle>
        <Button onClick={() => setShowAddPrescription(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Prescription
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <p className="text-muted-foreground">No prescriptions found.</p>
          ) : (
            prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium">
                      {prescription.medication_details?.name || prescription.medication}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(prescription.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">
                    {prescription.dosage} - {prescription.frequency}
                  </span>
                  {prescription.doctor && (
                    <span className="text-sm text-gray-500">
                      Prescribed by: Dr. {prescription.doctor.first_name} {prescription.doctor.last_name}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(prescription.start_date), 'MMM d, yyyy')} - {prescription.end_date && format(new Date(prescription.end_date), 'MMM d, yyyy')}
                </div>
                {prescription.notes && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {prescription.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={showAddPrescription} onOpenChange={setShowAddPrescription}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Prescription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Medication</label>
              <Input
                value={newPrescription.medication}
                onChange={(e) => setNewPrescription({ ...newPrescription, medication: e.target.value })}
                placeholder="Enter medication name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Dosage</label>
              <Input
                value={newPrescription.dosage}
                onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <Input
                value={newPrescription.frequency}
                onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                placeholder="e.g., Twice daily"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (days)</label>
              <Input
                type="number"
                value={newPrescription.duration.toString()}
                onChange={(e) => setNewPrescription({ ...newPrescription, duration: parseInt(e.target.value) || 0 })}
                placeholder="Enter number of days"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Refills</label>
              <Input
                type="number"
                value={newPrescription.refills}
                onChange={(e) => setNewPrescription({ ...newPrescription, refills: parseInt(e.target.value) })}
                placeholder="Number of refills"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={newPrescription.start_date}
                onChange={(e) => setNewPrescription({ ...newPrescription, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newPrescription.notes}
                onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
                placeholder="Enter any additional notes"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Doctor</label>
              <Select
                value={newPrescription.prescribed_by.toString()}
                onValueChange={(value) => setNewPrescription({ ...newPrescription, prescribed_by: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.first_name} {doctor.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPrescription(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPrescription}>
              Add Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
