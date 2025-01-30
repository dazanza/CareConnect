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
import { showToast } from '@/app/lib/toast'
import { Pill, Plus } from 'lucide-react'

interface Medication {
  id: number
  name: string
  dosage: string
  frequency: string
  instructions?: string
  status: string
  side_effects?: string
  user_id: string
}

interface MedicationFormData {
  name: string
  dosage: string
  frequency: string
  instructions?: string
  side_effects?: string
}

interface MedicationManagerProps {
  initialMedications?: Medication[]
}

export function MedicationManager({ initialMedications = [] }: MedicationManagerProps) {
  const { supabase } = useSupabase()
  const [medications, setMedications] = useState<Medication[]>(initialMedications)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    side_effects: ''
  })

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('medications')
        .insert({
          ...formData,
          user_id: user.id,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      setMedications([data, ...medications])
      setShowAddDialog(false)
      showToast.success('Medication added successfully')
    } catch (error) {
      console.error('Error adding medication:', error)
      showToast.error('Failed to add medication')
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
                {med.dosage} • {med.frequency}
              </p>
              {med.instructions && (
                <p className="text-sm text-muted-foreground mt-1">
                  Instructions: {med.instructions}
                </p>
              )}
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
                placeholder="Dosage (e.g., 50mg)"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              />
              <Input
                placeholder="Frequency (e.g., twice daily)"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />
              <Textarea
                placeholder="Instructions (optional)"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
              <Textarea
                placeholder="Side effects (optional)"
                value={formData.side_effects}
                onChange={(e) => setFormData({ ...formData, side_effects: e.target.value })}
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