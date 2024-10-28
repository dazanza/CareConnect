'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'

interface UploadDocumentDialogProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  onSuccess: () => void
}

export function UploadDocumentDialog({
  isOpen,
  onClose,
  patientId,
  onSuccess
}: UploadDocumentDialogProps) {
  const { supabase } = useSupabase()
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !file || !category) return

    try {
      setIsUploading(true)

      // Upload file to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${patientId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Create document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert([{
          patient_id: patientId,
          name: file.name,
          type: file.type,
          size: file.size,
          url: filePath,
          category
        }])

      if (insertError) throw insertError

      toast.success('Document uploaded successfully')
      onSuccess()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Document Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lab_result">Lab Result</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              File
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <Input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">PDF, PNG, JPG up to 10MB</p>
              </div>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-500">
                Selected file: {file.name}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || !file || !category}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
