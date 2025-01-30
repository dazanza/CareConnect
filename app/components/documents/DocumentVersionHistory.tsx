import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Download, RotateCcw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSupabase } from '@/app/hooks/useSupabase'

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

interface DocumentVersionHistoryProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
  onVersionRestore: (version: DocumentVersion) => Promise<void>
}

export function DocumentVersionHistory({
  documentId,
  isOpen,
  onClose,
  onVersionRestore
}: DocumentVersionHistoryProps) {
  const { supabase } = useSupabase()
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch versions when dialog opens
  useState(() => {
    if (isOpen && supabase) {
      fetchVersions()
    }
  }, [isOpen, documentId])

  const fetchVersions = async () => {
    if (!supabase) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })

      if (error) throw error
      setVersions(data)
    } catch (error) {
      console.error('Error fetching versions:', error)
      toast.error('Failed to load version history')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (version: DocumentVersion) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(version.file_path, 60)

      if (error) throw error
      
      window.open(data.signedUrl, '_blank')
    } catch (error) {
      console.error('Error downloading version:', error)
      toast.error('Failed to download version')
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading versions...</p>
          ) : versions.length === 0 ? (
            <p className="text-center text-muted-foreground">No version history available.</p>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h4 className="font-medium">
                      Version {version.version_number}
                      {version.comment && (
                        <span className="ml-2 font-normal text-muted-foreground">
                          - {version.comment}
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(version.created_at).toLocaleString()} • {formatFileSize(version.size)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(version)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {version.version_number !== 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onVersionRestore(version)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 