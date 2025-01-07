'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function SharedResourcesPage() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'shared_by_me' | 'shared_with_me'>('all')
  const [activeTab, setActiveTab] = useState('patients')
  const [isLoading, setIsLoading] = useState(true)
  const [sharedPatients, setSharedPatients] = useState<any[]>([])
  const [sharedFiles, setSharedFiles] = useState<any[]>([])

  // Fetch shared resources
  const fetchSharedResources = useCallback(async () => {
    if (!supabase || !user) return;
    setIsLoading(true);
    try {
      // Fetch shared patients
      const { data: patientShares, error: patientsError } = await supabase
        .from('patient_shares')
        .select(`
          id,
          patient_id,
          access_level,
          expires_at,
          shared_by:shared_by_user_id (
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
        .eq('shared_with_user_id', user.id);

      if (patientsError) throw patientsError;
      setSharedPatients(patientShares || []);

      // Fetch shared files
      const { data: fileShares, error: filesError } = await supabase
        .from('file_shares')
        .select(`
          id,
          file_id,
          access_level,
          expires_at,
          shared_by:shared_by_user_id (
            id,
            first_name,
            last_name
          ),
          file:files (
            id,
            name,
            type,
            size,
            uploaded_at
          )
        `)
        .eq('shared_with_user_id', user.id);

      if (filesError) throw filesError;
      setSharedFiles(fileShares || []);
    } catch (error) {
      console.error('Error fetching shared resources:', error);
      toast.error('Failed to load shared resources');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  // Filter resources based on search term
  const filterResources = (resources: any[]) => {
    if (!searchTerm) return resources
    
    const term = searchTerm.toLowerCase()
    return resources.filter(resource => {
      // For patients
      if (resource.patient) {
        return (
          resource.patient.first_name?.toLowerCase().includes(term) ||
          resource.patient.last_name?.toLowerCase().includes(term) ||
          resource.shared_by?.email.toLowerCase().includes(term) ||
          resource.shared_with?.email.toLowerCase().includes(term)
        )
      }
      // For files
      return (
        resource.file_name?.toLowerCase().includes(term) ||
        resource.patients?.first_name?.toLowerCase().includes(term) ||
        resource.patients?.last_name?.toLowerCase().includes(term)
      )
    })
  }

  // Effect to fetch data
  useEffect(() => {
    fetchSharedResources();
  }, [fetchSharedResources]);

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
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filterResources(sharedPatients).length > 0 ? (
            <div className="grid gap-4">
              {filterResources(sharedPatients).map((share) => (
                <Card key={share.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link 
                          href={`/patients/${share.patient_id}`}
                          className="text-xl font-semibold hover:underline flex items-center gap-2"
                        >
                          {share.patient.first_name} {share.patient.last_name}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <div className="text-sm text-muted-foreground mt-1">
                          Date of Birth: {format(new Date(share.patient.date_of_birth), 'MMM d, yyyy')}
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
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Shared by: {share.shared_by.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <UserMinus className="h-4 w-4" />
                          Shared with: {share.shared_with.email}
                        </div>
                      </div>
                      <div>
                        Shared on {format(new Date(share.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No shared patients found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filterResources(sharedFiles).length > 0 ? (
            <div className="grid gap-4">
              {filterResources(sharedFiles).map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xl font-semibold">
                          {file.file_name}
                        </div>
                        <Link 
                          href={`/patients/${file.patient_id}`}
                          className="text-sm text-muted-foreground mt-1 hover:underline flex items-center gap-1"
                        >
                          Patient: {file.patients.first_name} {file.patients.last_name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {file.file_type}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          Uploaded: {format(new Date(file.upload_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    {file.patient_shares?.map((share: any) => (
                      <div key={share.id} className="mt-4 flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Shared by: {share.shared_by.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <UserMinus className="h-4 w-4" />
                            Shared with: {share.shared_with.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            {share.access_level} access
                          </div>
                          {share.expires_at && (
                            <div>
                              Expires: {format(new Date(share.expires_at), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
      </Tabs>
    </div>
  )
} 