'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud, FileText, Image, FilePlus, Trash2, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { UploadDocumentDialog } from './UploadDocumentDialog'
import { format } from 'date-fns'
import { bytesToSize } from '@/lib/utils'

interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  category: 'lab_result' | 'prescription' | 'imaging' | 'other'
  uploaded_at: string
  updated_at: string
}

interface DocumentManagerProps {
  patientId: string
  initialDocuments?: Document[]
}

export function DocumentManager({ patientId, initialDocuments = [] }: DocumentManagerProps) {
  const { supabase } = useSupabase()
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialDocuments.length === 0) {
      fetchDocuments()
    }
  }, [patientId])

  async function fetchDocuments() {
    if (!supabase) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setDocuments(data)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDownload(document: Document) {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.url)

      if (error) throw error

      // Create a download link
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = document.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Failed to download document')
    }
  }

  async function handleDelete(documentId: string) {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      toast.success('Document deleted')
      setDocuments(documents.filter(doc => doc.id !== documentId))
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lab_result':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'prescription':
        return <FileText className="w-5 h-5 text-purple-500" />
      case 'imaging':
        return <Image className="w-5 h-5 text-green-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Documents</CardTitle>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <FilePlus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(document.category)}
                  <div>
                    <p className="font-medium">{document.name}</p>
                    <p className="text-sm text-gray-500">
                      {bytesToSize(document.size)} · Uploaded {format(new Date(document.uploaded_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(document)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(document.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No documents uploaded yet</p>
          </div>
        )}
      </CardContent>

      <UploadDocumentDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        patientId={patientId}
        onSuccess={() => {
          setIsUploadDialogOpen(false)
          fetchDocuments()
        }}
      />
    </Card>
  )
}
