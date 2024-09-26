'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSupabase } from '@/hooks/useSupabase'
import { toast } from 'react-hot-toast'

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
})

interface AddLogFormProps {
  onSuccess?: () => void
}

export default function AddLogForm({ onSuccess }: AddLogFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!supabase) return

    setIsLoading(true)
    const { data, error } = await supabase
      .from('logs')
      .insert([
        { title: values.title, description: values.description },
      ])

    setIsLoading(false)

    if (error) {
      toast.error('Failed to add log. Please try again.')
    } else {
      toast.success('Log added successfully!')
      form.reset()
      onSuccess?.()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Log title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Log description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Log'}
        </Button>
      </form>
    </Form>
  )
}