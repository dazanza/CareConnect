'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface Medication {
  id: string
  name: string
  form?: string
  strength?: string
}

interface MedicationSearchProps {
  onSelect: (medication: Medication) => void
}

export function MedicationSearch({ onSelect }: MedicationSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [medications, setMedications] = React.useState<Medication[]>([])
  const debouncedSearch = useDebounce(value, 300)

  React.useEffect(() => {
    if (!debouncedSearch) {
      setMedications([])
      return
    }

    async function searchMedications() {
      setLoading(true)
      try {
        // In a real app, this would call an actual drug database API
        // For demo purposes, we'll simulate an API call with mock data
        const mockMedications: Medication[] = [
          { id: '1', name: 'Acetaminophen', form: 'Tablet', strength: '500mg' },
          { id: '2', name: 'Amoxicillin', form: 'Capsule', strength: '250mg' },
          { id: '3', name: 'Ibuprofen', form: 'Tablet', strength: '200mg' },
          { id: '4', name: 'Lisinopril', form: 'Tablet', strength: '10mg' },
          { id: '5', name: 'Metformin', form: 'Tablet', strength: '500mg' },
        ].filter(med => 
          med.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        )

        setMedications(mockMedications)
      } catch (error) {
        console.error('Error searching medications:', error)
        setMedications([])
      } finally {
        setLoading(false)
      }
    }

    searchMedications()
  }, [debouncedSearch])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? medications.find((medication) => medication.name === value)?.name
            : "Search medications..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search medications..."
            value={value}
            onValueChange={setValue}
          />
          <CommandEmpty>
            {loading ? 'Searching...' : 'No medication found.'}
          </CommandEmpty>
          <CommandGroup>
            {medications.map((medication) => (
              <CommandItem
                key={medication.id}
                value={medication.name}
                onSelect={(currentValue) => {
                  setValue(currentValue)
                  onSelect(medication)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === medication.name ? "opacity-100" : "opacity-0"
                  )}
                />
                <div>
                  <div>{medication.name}</div>
                  {medication.form && medication.strength && (
                    <div className="text-sm text-muted-foreground">
                      {medication.form} • {medication.strength}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 