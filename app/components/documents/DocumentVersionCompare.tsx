'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { useSupabase } from '@/app/hooks/useSupabase'
import { bytesToSize } from '@/lib/utils'

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

interface DocumentVersionCompareProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
}

export function DocumentVersionCompare({
  documentId,
  isOpen,
  onClose
}: DocumentVersionCompareProps) {
  const { supabase } = useSupabase()
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [selectedVersions, setSelectedVersions] = useState<[string, string]>(['', ''])
  const [urls, setUrls] = useState<[string, string]>(['', ''])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
      
      // Auto-select the two most recent versions if available
      if (data.length >= 2) {
        setSelectedVersions([data[0].id, data[1].id])
      }
    } catch (error) {
      console.error('Error fetching versions:', error)
      toast.error('Failed to load versions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVersionSelect = async (versionId: string, index: 0 | 1) => {
    setSelectedVersions(prev => {
      const next = [...prev] as [string, string]
      next[index] = versionId
      return next
    })

    if (!supabase || !versionId) return

    try {
      const version = versions.find(v => v.id === versionId)
      if (!version) return

      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(version.file_path, 3600) // 1 hour expiry

      if (error) throw error

      setUrls(prev => {
        const next = [...prev] as [string, string]
        next[index] = data.signedUrl
        return next
      })
    } catch (error) {
      console.error('Error getting signed URL:', error)
      toast.error('Failed to load document')
    }
  }

  const handleCompare = () => {
    if (urls[0] && urls[1]) {
      // Open both URLs in new tabs
      window.open(urls[0], '_blank')
      window.open(urls[1], '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compare Versions</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading versions...</p>
          ) : versions.length < 2 ? (
            <p className="text-center text-muted-foreground">Need at least two versions to compare.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1].map((index) => (
                  <div key={index} className="space-y-2">
                    <label className="text-sm font-medium">
                      {index === 0 ? 'First Version' : 'Second Version'}
                    </label>
                    <Select
                      value={selectedVersions[index]}
                      onValueChange={(value) => handleVersionSelect(value, index as 0 | 1)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            Version {version.version_number} ({bytesToSize(version.size)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedVersions[index] && (
                      <div className="text-sm text-muted-foreground">
                        {(() => {
                          const version = versions.find(v => v.id === selectedVersions[index])
                          if (!version) return null
                          return (
                            <>
                              Created: {new Date(version.created_at).toLocaleString()}
                              {version.comment && <><br />{version.comment}</>}
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleCompare}
                  disabled={!selectedVersions[0] || !selectedVersions[1]}
                >
                  Compare Selected Versions
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 