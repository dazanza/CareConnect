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
import { Pill, Plus, Calendar, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from "react-hot-toast"
import { useSupabase } from '@/app/hooks/useSupabase'
import { format } from 'date-fns'
import { Badge } from "@/components/ui/badge"
import { Doctor } from '@/types'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string | null
  instructions: string
  status: 'active' | 'discontinued' | 'completed'
  reason_for_discontinuation?: string
  side_effects?: string
  adherence_rate?: number
  doctor_id: string
  patient_id: string
  doctor?: {
    id: string
    first_name: string
    last_name: string
  }
}

interface MedicationsTrackerProps {
  patientId: string
  doctors: Doctor[]
  initialMedications?: Medication[]
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  discontinued: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
}

export function MedicationsTracker({
  patientId,
  doctors,
  initialMedications = []
}: MedicationsTrackerProps) {
  const { supabase } = useSupabase()
  const [medications, setMedications] = useState<Medication[]>(initialMedications)
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [showDiscontinue, setShowDiscontinue] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [newMedication, setNewMedication] = useState<{
    name: string
    dosage: string
    frequency: string
    start_date: string
    end_date: string | null
    instructions: string
    doctor_id: string
  }>({
    name: '',
    dosage: '',
    frequency: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: null,
    instructions: '',
    doctor_id: ''
  })
  const [discontinueReason, setDiscontinueReason] = useState('')

  const handleAddMedication = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('medications')
        .insert({
          ...newMedication,
          patient_id: parseInt(patientId),
          doctor_id: parseInt(newMedication.doctor_id),
          status: 'active'
        })
        .select(`
          *,
          doctor:doctors (
            id,
            first_name,
            last_name
          )
        `)
        .single()

      if (error) throw error

      setMedications([data, ...medications])
      setShowAddMedication(false)
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: null,
        instructions: '',
        doctor_id: ''
      })
      toast.success('Medication added successfully')
    } catch (error) {
      console.error('Error adding medication:', error)
      toast.error('Failed to add medication')
    }
  }

  const handleDiscontinue = async () => {
    if (!supabase || !selectedMedication) return

    try {
      const { error } = await supabase
        .from('medications')
        .update({
          status: 'discontinued',
          end_date: new Date().toISOString(),
          reason_for_discontinuation: discontinueReason
        })
        .eq('id', selectedMedication.id)

      if (error) throw error

      setMedications(medications.map(med =>
        med.id === selectedMedication.id
          ? {
              ...med,
              status: 'discontinued',
              end_date: new Date().toISOString(),
              reason_for_discontinuation: discontinueReason
            }
          : med
      ))
      setShowDiscontinue(false)
      setSelectedMedication(null)
      setDiscontinueReason('')
      toast.success('Medication discontinued successfully')
    } catch (error) {
      console.error('Error discontinuing medication:', error)
      toast.error('Failed to discontinue medication')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Medications</CardTitle>
        <Button onClick={() => setShowAddMedication(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.length === 0 ? (
            <p className="text-muted-foreground">No medications recorded.</p>
          ) : (
            medications.map((medication) => (
              <div
                key={medication.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium">{medication.name}</h3>
                  </div>
                  <Badge variant="secondary" className={statusColors[medication.status]}>
                    {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {medication.dosage} • {medication.frequency}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  Started: {format(new Date(medication.start_date), 'MMM d, yyyy')}
                  {medication.end_date && ` • Ended: ${format(new Date(medication.end_date), 'MMM d, yyyy')}`}
                </div>
                {medication.instructions && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {medication.instructions}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Prescribed by Dr. {medication.doctor?.first_name} {medication.doctor?.last_name}
                </p>
                {medication.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSelectedMedication(medication)
                      setShowDiscontinue(true)
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Discontinue
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Medication Name</label>
              <Input
                value={newMedication.name}
                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                placeholder="Enter medication name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Dosage</label>
              <Input
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <Input
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                placeholder="e.g., Twice daily"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={newMedication.start_date}
                onChange={(e) => setNewMedication({ ...newMedication, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Instructions</label>
              <Textarea
                value={newMedication.instructions}
                onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                placeholder="Enter special instructions"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Doctor</label>
              <Select
                value={newMedication.doctor_id}
                onValueChange={(value) => setNewMedication({ ...newMedication, doctor_id: value })}
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
            <Button variant="outline" onClick={() => setShowAddMedication(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMedication}>
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscontinue} onOpenChange={setShowDiscontinue}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discontinue Medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for Discontinuation</label>
              <Textarea
                value={discontinueReason}
                onChange={(e) => setDiscontinueReason(e.target.value)}
                placeholder="Enter reason for discontinuing medication"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDiscontinue(false)
              setSelectedMedication(null)
              setDiscontinueReason('')
            }}>
              Cancel
            </Button>
            <Button onClick={handleDiscontinue}>
              Confirm Discontinuation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
