'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { FileUp, File, Trash2, Download, Eye } from 'lucide-react'
import { toast } from "react-hot-toast"
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
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState<Document['category']>('other')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !supabase) return

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${patientId}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(fileName)

      // Save document metadata to database
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          patient_id: patientId,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          url: publicUrl,
          category,
        })
        .select()
        .single()

      if (docError) throw docError

      setDocuments([docData, ...documents])
      setShowUpload(false)
      toast.success('Document uploaded successfully')
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
      setSelectedFile(null)
      setCategory('other')
    }
  }

  const handleDelete = async (documentId: string, fileName: string) => {
    if (!supabase) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('patient-documents')
        .remove([fileName])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (dbError) throw dbError

      setDocuments(documents.filter(doc => doc.id !== documentId))
      toast.success('Document deleted successfully')
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <Button onClick={() => setShowUpload(true)}>
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
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <File className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(doc.size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.url} download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id, doc.url.split('/').pop()!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={category} onValueChange={(value: Document['category']) => setCategory(value)}>
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
            <div>
              <label className="block text-sm font-medium mb-1">File</label>
              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
