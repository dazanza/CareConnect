'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Pill, Plus, AlertCircle } from 'lucide-react'
import type { Medication, MedicationForm, MedicationFormData } from '@/app/types'

const MEDICATION_FORMS: MedicationForm[] = [
  'tablet',
  'capsule',
  'liquid',
  'injection',
  'topical',
  'inhaler',
  'patch'
]

interface MedicationManagerProps {
  initialMedications?: Medication[]
}

export function MedicationManager({ initialMedications = [] }: MedicationManagerProps) {
  const { supabase } = useSupabase()
  const [medications, setMedications] = useState<Medication[]>(initialMedications)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    generic_name: '',
    strength: '',
    form: 'tablet',
    manufacturer: '',
    description: '',
    warnings: '',
    side_effects: '',
    interactions: ''
  })

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('medications')
        .insert({
          ...formData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      setMedications([data, ...medications])
      setShowAddDialog(false)
      toast.success('Medication added successfully')
    } catch (error) {
      console.error('Error adding medication:', error)
      toast.error('Failed to add medication')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Medications</CardTitle>
        <Button onClick={() => setShowAddDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </CardHeader>
      <CardContent>
        {medications.map((med) => (
          <div key={med.id} className="flex items-center gap-4 p-4 border rounded-lg mb-4">
            <Pill className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-medium">{med.name}</h4>
              <p className="text-sm text-muted-foreground">
                {med.strength} • {med.form}
                {med.generic_name && <span className="ml-2">({med.generic_name})</span>}
              </p>
            </div>
          </div>
        ))}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Medication name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Generic name (optional)"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
              />
              <Input
                placeholder="Strength (e.g., 50mg)"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
              />
              <Select
                value={formData.form}
                onValueChange={(value: MedicationForm) => setFormData({ ...formData, form: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  {MEDICATION_FORMS.map((form) => (
                    <SelectItem key={form} value={form}>
                      {form.charAt(0).toUpperCase() + form.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Medication</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}