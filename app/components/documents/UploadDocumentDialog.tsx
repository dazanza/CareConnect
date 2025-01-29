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
import { UploadProgress, UploadStatus } from '../ui/upload-progress'

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
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Reset state when dialog closes
  const handleClose = () => {
    setFile(null)
    setCategory('')
    setUploadStatus('idle')
    setUploadProgress(0)
    onClose()
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !file || !category) return

    try {
      setUploadStatus('uploading')
      setUploadProgress(0)

      // Upload file to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${patientId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Track progress manually since Supabase doesn't support progress events
      const fileSize = file.size
      const chunkSize = Math.floor(fileSize / 10) // Simulate 10 progress updates
      let loaded = 0

      const progressInterval = setInterval(() => {
        loaded = Math.min(loaded + chunkSize, fileSize)
        const percent = (loaded / fileSize) * 100
        setUploadProgress(percent)
        
        if (loaded >= fileSize) {
          clearInterval(progressInterval)
        }
      }, 200)

      setUploadStatus('processing')

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

      setUploadStatus('complete')
      toast.success('Document uploaded successfully')
      onSuccess()
      
      // Close dialog after a brief delay to show completion
      setTimeout(handleClose, 1000)
    } catch (error) {
      console.error('Error uploading document:', error)
      setUploadStatus('error')
      toast.error('Failed to upload document')
    }
  }

  // Handle upload cancellation
  const handleCancel = () => {
    // In a real implementation, you would also want to abort the upload
    setUploadStatus('idle')
    setUploadProgress(0)
    setFile(null)
  }

  // Handle retry
  const handleRetry = () => {
    if (file) {
      handleUpload(new Event('submit') as any)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
          
          {/* Only show file input if no file is selected or upload failed */}
          {(!file || uploadStatus === 'error') && (
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
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0]
                          if (selectedFile) {
                            setFile(selectedFile)
                            setUploadStatus('idle')
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>
          )}

          {/* Show upload progress when a file is selected */}
          {file && (
            <UploadProgress
              fileName={file.name}
              progress={uploadProgress}
              status={uploadStatus}
              onCancel={uploadStatus === 'uploading' ? handleCancel : undefined}
              onRetry={uploadStatus === 'error' ? handleRetry : undefined}
            />
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!file || !category || uploadStatus === 'uploading' || uploadStatus === 'processing'}
            >
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
