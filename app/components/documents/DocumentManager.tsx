'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { FileUp, File, Trash2, Download, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSupabase } from '@/app/hooks/useSupabase'

interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploaded_at: string
  category: 'lab_result' | 'prescription' | 'imaging' | 'other'
}

interface DocumentManagerProps {
  patientId: string
  initialDocuments?: Document[]
}

export function DocumentManager({ patientId, initialDocuments = [] }: DocumentManagerProps) {
  const { supabase } = useSupabase()
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    category: '' as Document['category'],
    name: ''
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadData(prev => ({
        ...prev,
        file,
        name: file.name
      }))
    }
  }

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.category || !supabase) return

    try {
      // Upload file to storage
      const fileExt = uploadData.file.name.split('.').pop()
      const fileName = `${patientId}/${Date.now()}.${fileExt}`
      
      const { data: uploadData_, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadData.file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      // Save document metadata to database
      const { data, error } = await supabase
        .from('documents')
        .insert({
          patient_id: patientId,
          name: uploadData.name,
          category: uploadData.category,
          type: uploadData.file.type,
          size: uploadData.file.size,
          url: publicUrl,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setDocuments([data, ...documents])
      setIsUploadDialogOpen(false)
      toast.success('Document uploaded successfully')
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    }
  }

  const handleDelete = async (id: string, url: string) => {
    try {
      // Delete from storage
      const filePath = url.split('/').pop()
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([filePath])
        
        if (storageError) throw storageError
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDocuments(documents.filter(doc => doc.id !== id))
      toast.success('Document deleted successfully')
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <FileUp className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length === 0 ? (
            <p className="text-muted-foreground">No documents uploaded yet.</p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <File className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(doc.uploaded_at).toLocaleDateString()} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = doc.url
                      link.download = doc.name
                      link.click()
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id, doc.url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Document</label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={uploadData.category}
                onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value as Document['category'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab_result">Lab Result</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
