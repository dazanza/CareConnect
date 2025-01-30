'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { FileUp, File, Trash2, Download, Eye, History, GitCompare } from 'lucide-react'
import { showToast } from '@/app/lib/toast'
import { useSupabase } from '@/app/hooks/useSupabase'
import { UploadProgress } from '../ui/upload-progress'
import { DocumentVersionHistory } from './DocumentVersionHistory'
import { DocumentVersionCompare } from './DocumentVersionCompare'

/**
 * Document type representing a medical document in the system
 * @interface Document
 * @property {string} id - Unique identifier for the document
 * @property {string} name - Name of the document
 * @property {string} type - MIME type of the document
 * @property {number} size - Size of the document in bytes
 * @property {string} url - Storage URL of the document
 * @property {string} uploaded_at - Timestamp when the document was uploaded
 * @property {'lab_result' | 'prescription' | 'imaging' | 'other'} category - Category of the medical document
 * @property {number} current_version - Current version number of the document
 * @property {number} version_count - Total number of versions
 */
interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploaded_at: string
  category: 'lab_result' | 'prescription' | 'imaging' | 'other'
  current_version: number
  version_count: number
}

interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  file_path: string
  size: number
  created_by: string
  created_at: string
  comment?: string
  metadata?: Record<string, any>
}

/**
 * Props for the DocumentManager component
 * @interface DocumentManagerProps
 * @property {string} patientId - ID of the patient whose documents are being managed
 * @property {Document[]} initialDocuments - Initial list of documents to display
 * @property {boolean} [canEdit=true] - Whether the user has permission to edit documents
 */
interface DocumentManagerProps {
  patientId: string
  initialDocuments?: Document[]
  canEdit?: boolean
}

/**
 * DocumentManager Component
 * 
 * A comprehensive document management system for medical records that allows:
 * - Uploading new medical documents
 * - Categorizing documents (lab results, prescriptions, imaging, etc.)
 * - Viewing document details and version history
 * - Downloading documents
 * - Deleting documents (with proper permissions)
 * 
 * Features:
 * - Real-time upload progress tracking
 * - File type validation
 * - Secure storage using Supabase
 * - Document versioning
 * - Category-based organization
 * - Responsive design
 * - Error handling with user feedback
 * 
 * @component
 * @param {DocumentManagerProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function DocumentManager({ patientId, initialDocuments = [], canEdit = true }: DocumentManagerProps) {
  const { supabase } = useSupabase()
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Document['category'] | 'all'>('all')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    category: '' as Document['category'],
    name: ''
  })
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false)
  const [isVersionCompareOpen, setIsVersionCompareOpen] = useState(false)

  // Filter and group documents by category
  const filteredDocuments = documents.filter(doc => 
    selectedCategory === 'all' ? true : doc.category === selectedCategory
  )

  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<Document['category'], Document[]>)

  /**
   * Handles file selection for upload
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadData(prev => ({
        ...prev,
        file,
        name: file.name
      }))
      setUploadStatus('idle')
      setUploadProgress(0)
    }
  }

  /**
   * Handles document upload with progress tracking
   */
  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.category || !supabase) return

    setUploadStatus('uploading')
    setUploadProgress(0)

    try {
      // Upload file to storage
      const fileExt = uploadData.file.name.split('.').pop()
      const fileName = `${patientId}/${Date.now()}.${fileExt}`
      
      const { data: uploadData_, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadData.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Simulate upload progress since Supabase doesn't support progress events
      const fileSize = uploadData.file.size
      const chunkSize = Math.floor(fileSize / 10)
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
          current_version: 1,
          version_count: 1,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Create initial version record
      const { error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: data.id,
          version_number: 1,
          file_path: fileName,
          size: uploadData.file.size,
          created_by: supabase.auth.getUser().then(({ data }) => data.user?.id),
          comment: 'Initial version'
        })

      if (versionError) throw versionError

      setDocuments([data, ...documents])
      setUploadStatus('complete')
      showToast.success('Document uploaded successfully')
      
      // Close dialog after a brief delay to show completion
      setTimeout(() => {
        setIsUploadDialogOpen(false)
        setUploadData({
          file: null,
          category: '' as Document['category'],
          name: ''
        })
        setUploadStatus('idle')
        setUploadProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Error uploading document:', error)
      setUploadStatus('error')
      showToast.error('Failed to upload document')
    }
  }

  /**
   * Handles document deletion
   */
  const handleDelete = async (id: string, url: string) => {
    if (!supabase) return

    try {
      // Delete from storage
      const filePath = url.split('/').pop()
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([filePath])
        
        if (storageError) throw storageError
      }

      // Delete all versions from storage and database
      const { data: versions, error: versionsError } = await supabase
        .from('document_versions')
        .select('file_path')
        .eq('document_id', id)

      if (versionsError) throw versionsError

      if (versions.length > 0) {
        // Delete version files from storage
        const { error: versionStorageError } = await supabase.storage
          .from('documents')
          .remove(versions.map(v => v.file_path))

        if (versionStorageError) throw versionStorageError

        // Delete version records
        const { error: versionDeleteError } = await supabase
          .from('document_versions')
          .delete()
          .eq('document_id', id)

        if (versionDeleteError) throw versionDeleteError
      }

      // Delete document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDocuments(documents.filter(doc => doc.id !== id))
      showToast.success('Document deleted successfully')
    } catch (error) {
      console.error('Error deleting document:', error)
      showToast.error('Failed to delete document')
    }
  }

  /**
   * Formats file size into human-readable format
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle upload cancellation
  const handleCancel = () => {
    setUploadStatus('idle')
    setUploadProgress(0)
    setUploadData({
      file: null,
      category: '' as Document['category'],
      name: ''
    })
  }

  // Handle retry
  const handleRetry = () => {
    if (uploadData.file) {
      handleUpload()
    }
  }

  const handleVersionRestore = async (version: DocumentVersion) => {
    if (!supabase || !selectedDocument) return

    try {
      // Update document's current version
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          current_version: version.version_number
        })
        .eq('id', selectedDocument.id)

      if (updateError) throw updateError

      // Update document in state
      setDocuments(docs => docs.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, current_version: version.version_number }
          : doc
      ))

      showToast.success('Document version restored')
    } catch (error) {
      console.error('Error restoring version:', error)
      showToast.error('Failed to restore version')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>View and manage patient documents</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as Document['category'] | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="lab_result">Lab Results</SelectItem>
              <SelectItem value="prescription">Prescriptions</SelectItem>
              <SelectItem value="imaging">Imaging</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {canEdit && (
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <FileUp className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {documents.length === 0 ? (
            <p className="text-muted-foreground">No documents uploaded yet.</p>
          ) : filteredDocuments.length === 0 ? (
            <p className="text-muted-foreground">No documents found in this category.</p>
          ) : (
            Object.entries(documentsByCategory).map(([category, docs]) => (
              <div key={category} className="space-y-4">
                <h3 className="font-semibold capitalize">
                  {category.split('_').join(' ')}
                  <span className="ml-2 text-muted-foreground font-normal">({docs.length})</span>
                </h3>
                <div className="grid gap-4">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <File className="w-8 h-8 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(doc.uploaded_at).toLocaleDateString()} • {formatFileSize(doc.size)}
                            {doc.version_count > 1 && ` • Version ${doc.current_version} of ${doc.version_count}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {doc.version_count > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedDocument(doc)
                                setIsVersionHistoryOpen(true)
                              }}
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedDocument(doc)
                                setIsVersionCompareOpen(true)
                              }}
                            >
                              <GitCompare className="w-4 h-4" />
                            </Button>
                          </>
                        )}
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
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doc.id, doc.url)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
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
            {(!uploadData.file || uploadStatus === 'error') && (
              <div>
                <label className="text-sm font-medium">File</label>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
            )}
            {uploadData.file && (
              <UploadProgress
                fileName={uploadData.file.name}
                progress={uploadProgress}
                status={uploadStatus}
                onCancel={uploadStatus === 'uploading' ? handleCancel : undefined}
                onRetry={uploadStatus === 'error' ? handleRetry : undefined}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadData.file || !uploadData.category || uploadStatus === 'uploading' || uploadStatus === 'processing'}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedDocument && (
        <>
          <DocumentVersionHistory
            documentId={selectedDocument.id}
            isOpen={isVersionHistoryOpen}
            onClose={() => {
              setIsVersionHistoryOpen(false)
              setSelectedDocument(null)
            }}
            onVersionRestore={handleVersionRestore}
          />
          <DocumentVersionCompare
            documentId={selectedDocument.id}
            isOpen={isVersionCompareOpen}
            onClose={() => {
              setIsVersionCompareOpen(false)
              setSelectedDocument(null)
            }}
          />
        </>
      )}
    </Card>
  )
}
