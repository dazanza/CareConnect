/**
 * TimelineShare Component
 * 
 * Handles sharing timeline events with other healthcare providers
 * with customizable permissions and expiration dates.
 */

'use client'

import { useState } from 'react'
import { TimelineEvent } from '@/types/timeline'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Share2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { showToast } from '@/app/lib/toast'
import { useSupabase } from '@/app/hooks/useSupabase'
import { DatePicker } from '@/components/ui/date-picker'
import { addDays } from 'date-fns'

const shareFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  expiresAt: z.date().optional(),
  accessLevel: z.enum(['read', 'write']).default('read'),
})

type ShareFormValues = z.infer<typeof shareFormSchema>

interface TimelineShareProps {
  events: TimelineEvent[]
  patientId: number
  patientName?: string
}

export function TimelineShare({ events, patientId, patientName }: TimelineShareProps) {
  const { supabase } = useSupabase()
  const [isOpen, setIsOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      email: '',
      expiresAt: addDays(new Date(), 30), // Default expiration of 30 days
      accessLevel: 'read',
    },
  })

  const onSubmit = async (data: ShareFormValues) => {
    if (!supabase) return

    setIsSharing(true)
    try {
      // First check if the user exists
      const { data: users, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', data.email)
        .single()

      if (userError || !users) {
        showToast.error('User not found. Please check the email address.')
        return
      }

      // Create share record
      const { error: shareError } = await supabase
        .from('patient_shares')
        .insert({
          patient_id: patientId,
          shared_with_user_id: users.id,
          access_level: data.accessLevel,
          expires_at: data.expiresAt?.toISOString(),
        })

      if (shareError) throw shareError

      showToast.success('Timeline shared successfully')
      setIsOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error sharing timeline:', error)
      showToast.error('Failed to share timeline')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Timeline</DialogTitle>
          <DialogDescription>
            Share {patientName ? `${patientName}'s` : 'patient'} timeline with another healthcare provider.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Email</FormLabel>
                  <FormControl>
                    <Input placeholder="doctor@hospital.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the email address of the healthcare provider.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires At</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onChange={field.onChange}
                      disabled={(date) => date < new Date()}
                      placeholder="Select expiration date"
                    />
                  </FormControl>
                  <FormDescription>
                    Choose when this share should expire.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Level</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="read">Read Only</option>
                      <option value="write">Read & Write</option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    Choose what level of access to grant.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSharing}>
                {isSharing ? 'Sharing...' : 'Share Timeline'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
