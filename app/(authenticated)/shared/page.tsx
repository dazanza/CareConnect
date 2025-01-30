'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import {
  Users,
  FileText,
  Clock,
  Shield,
  Search,
  UserPlus,
  UserMinus,
  ExternalLink,
  Share2,
  UserCheck,
  MoreHorizontal,
  XCircle,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { showToast } from '@/app/lib/toast'
import { SharedResourcesSkeleton } from "@/app/components/ui/skeletons"

interface PatientShare {
  id: string
  patient_id: string
  access_level: string
  expires_at: string | null
  shared_by_user_id: string
  shared_with_user_id: string
  shared_by: {
    id: string
    first_name: string
    last_name: string
  }
  shared_with: {
    id: string
    first_name: string
    last_name: string
  }
  patient: {
    id: string
    first_name: string
    last_name: string
    date_of_birth: string
    gender: string
  }
}

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploaded_at: string
  patient_id: number
  url: string
  category: string
  patient: {
    id: number
    first_name: string
    last_name: string
  }
}

export default function SharedResourcesPage() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'shared_by_me' | 'shared_with_me'>('all')
  const [activeTab, setActiveTab] = useState('patients')
  const [isLoading, setIsLoading] = useState(true)
  const [incomingShares, setIncomingShares] = useState<PatientShare[]>([])
  const [outgoingShares, setOutgoingShares] = useState<PatientShare[]>([])
  const [sharedFiles, setSharedFiles] = useState<Document[]>([])

  // Fetch shared resources
  const fetchSharedResources = useCallback(async () => {
    if (!supabase || !user) return;
    setIsLoading(true);
    try {
      // Split the queries into smaller chunks
      const [incomingResult, outgoingResult, filesResult] = await Promise.all([
        // Fetch patients shared with me
        supabase
          .from('patient_shares')
          .select(`
            id,
            patient_id,
            access_level,
            expires_at,
            shared_by_user_id,
            shared_with_user_id,
            shared_by:users!shared_by_user_id (
              id,
              first_name,
              last_name
            ),
            patient:patients (
              id,
              first_name,
              last_name,
              date_of_birth,
              gender
            )
          `)
          .eq('shared_with_user_id', user.id)
          .limit(50),

        // Fetch patients I've shared with others
        supabase
          .from('patient_shares')
          .select(`
            id,
            patient_id,
            access_level,
            expires_at,
            shared_by_user_id,
            shared_with_user_id,
            shared_with:users!shared_with_user_id (
              id,
              first_name,
              last_name
            ),
            patient:patients (
              id,
              first_name,
              last_name,
              date_of_birth,
              gender
            )
          `)
          .eq('shared_by_user_id', user.id)
          .limit(50),

        // Fetch shared documents
        supabase
          .from('documents')
          .select(`
            id,
            name,
            type,
            size,
            uploaded_at,
            url,
            category,
            patient_id,
            patient:patients (
              id,
              first_name,
              last_name
            )
          `)
          .neq('user_id', user.id)
          .order('uploaded_at', { ascending: false })
          .limit(50)
      ]);

      if (incomingResult.error) throw incomingResult.error;
      if (outgoingResult.error) throw outgoingResult.error;
      if (filesResult.error) throw filesResult.error;

      // Process and merge shared user data
      const processShares = (shares: any[], isIncoming: boolean) => 
        shares.map(share => ({
          ...share,
          shared_by: isIncoming ? share.shared_by : {
            id: user.id,
            first_name: user.user_metadata?.first_name || 'Unknown',
            last_name: user.user_metadata?.last_name || ''
          },
          shared_with: !isIncoming ? share.shared_with : {
            id: user.id,
            first_name: user.user_metadata?.first_name || 'Unknown',
            last_name: user.user_metadata?.last_name || ''
          }
        }));

      setIncomingShares(processShares(incomingResult.data || [], true));
      setOutgoingShares(processShares(outgoingResult.data || [], false));
      setSharedFiles(filesResult.data?.map(file => ({
        ...file,
        patient: Array.isArray(file.patient) && file.patient[0] 
          ? {
              id: file.patient[0].id || 0,
              first_name: file.patient[0].first_name || '',
              last_name: file.patient[0].last_name || ''
            }
          : {
              id: 0,
              first_name: '',
              last_name: ''
            }
      })) || []);
    } catch (error) {
      console.error('Error fetching shared resources:', error)
      showToast.error('Failed to load shared resources')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    if (supabase && user) {
      fetchSharedResources()
    }
  }, [fetchSharedResources])

  // Handle ending a share
  const handleEndShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('patient_shares')
        .delete()
        .eq('id', shareId)

      if (error) throw error

      showToast.success('Share ended successfully')
      fetchSharedResources()
    } catch (error) {
      console.error('Error ending share:', error)
      showToast.error('Failed to end share')
    }
  }

  // Handle editing a share
  const handleEditShare = async (share: PatientShare) => {
    try {
      const { error } = await supabase
        .from('patient_shares')
        .update({
          access_level: share.access_level === 'read' ? 'write' : 'read',
        })
        .eq('id', share.id);

      if (error) throw error;

      showToast.success('Share updated successfully');
      fetchSharedResources();
    } catch (error) {
      console.error('Error updating share:', error);
      showToast.error('Failed to update share');
    }
  };

  // Filter resources based on search term and type
  const getFilteredShares = useCallback(() => {
    const shares = filterType === 'shared_by_me'
      ? outgoingShares
      : filterType === 'shared_with_me'
        ? incomingShares
        : [...incomingShares, ...outgoingShares];

    if (!searchTerm) return shares;

    const term = searchTerm.toLowerCase();
    return shares.filter(share =>
      share.patient.first_name?.toLowerCase().includes(term) ||
      share.patient.last_name?.toLowerCase().includes(term) ||
      share.shared_by.first_name?.toLowerCase().includes(term) ||
      share.shared_by.last_name?.toLowerCase().includes(term) ||
      share.shared_with.first_name?.toLowerCase().includes(term) ||
      share.shared_with.last_name?.toLowerCase().includes(term)
    );
  }, [filterType, searchTerm, incomingShares, outgoingShares]);

  // Effect to stop loading if no data after a timeout
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
        }
      }, 10000); // 10 seconds timeout
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return <SharedResourcesSkeleton />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shared Resources</h1>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shares</SelectItem>
              <SelectItem value="shared_by_me">Shared by Me</SelectItem>
              <SelectItem value="shared_with_me">Shared with Me</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="shares" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Share Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : getFilteredShares().length > 0 ? (
            <div className="grid gap-4">
              {getFilteredShares().map((share: PatientShare) => (
                <Card key={share.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/patients/${share.patient.id}`}
                          className="text-xl font-semibold hover:underline flex items-center gap-2"
                        >
                          {share.patient.first_name} {share.patient.last_name}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <div className="text-sm text-muted-foreground mt-1">
                          {share.shared_by_user_id === user?.id ? (
                            <span className="flex items-center gap-2">
                              <Share2 className="h-4 w-4" />
                              Shared with {share.shared_with.first_name} {share.shared_with.last_name}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Share2 className="h-4 w-4" />
                              Shared by {share.shared_by.first_name} {share.shared_by.last_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-blue-500" />
                          {share.access_level} access
                        </div>
                        {share.expires_at && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            Expires: {format(new Date(share.expires_at), 'MMM d, yyyy')}
                          </div>
                        )}
                        {share.shared_by_user_id === user?.id && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditShare(share)}
                              title={share.access_level === 'read' ? 'Grant Write Access' : 'Restrict to Read'}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleEndShare(share.id)}
                              title="End Share"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {filterType === 'shared_by_me' 
                  ? "You haven't shared any patients"
                  : filterType === 'shared_with_me'
                    ? "No patients have been shared with you"
                    : "No shared patients found"}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : sharedFiles.length > 0 ? (
            <div className="grid gap-4">
              {sharedFiles.map((file: Document) => (
                <Card key={file.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={file.url}
                          target="_blank"
                          className="text-xl font-semibold flex items-center gap-2"
                        >
                          {file.name}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <div className="text-sm text-muted-foreground mt-1">
                          Patient: {file.patient.first_name} {file.patient.last_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-blue-500" />
                          {file.type}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          Uploaded: {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Category: {file.category}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No shared files found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="shares" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Shares</CardTitle>
              </CardHeader>
              <CardContent>
                {incomingShares.length > 0 ? (
                  <div className="space-y-4">
                    {incomingShares.map(share => (
                      <div key={share.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <div className="font-medium">
                            {share.patient.first_name} {share.patient.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Share2 className="h-4 w-4" />
                              Shared by: {share.shared_by?.first_name || 'Unknown'} {share.shared_by?.last_name || ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            {share.access_level} access
                            {share.expires_at && ` · Expires: ${format(new Date(share.expires_at), 'MMM d, yyyy')}`}
                          </div>
                          {share.shared_by_user_id === user?.id && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditShare(share)}
                                title={share.access_level === 'read' ? 'Grant Write Access' : 'Restrict to Read'}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleEndShare(share.id)}
                                title="End Share"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No incoming shares
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outgoing Shares</CardTitle>
              </CardHeader>
              <CardContent>
                {outgoingShares.length > 0 ? (
                  <div className="space-y-4">
                    {outgoingShares.map(share => (
                      <div key={share.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <div className="font-medium">
                            {share.patient.first_name} {share.patient.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-4 w-4" />
                              Shared with: {share.shared_with?.first_name || 'Unknown'} {share.shared_with?.last_name || ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            {share.access_level} access
                            {share.expires_at && ` · Expires: ${format(new Date(share.expires_at), 'MMM d, yyyy')}`}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditShare(share)}
                              title={share.access_level === 'read' ? 'Grant Write Access' : 'Restrict to Read'}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleEndShare(share.id)}
                              title="End Share"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No outgoing shares
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}