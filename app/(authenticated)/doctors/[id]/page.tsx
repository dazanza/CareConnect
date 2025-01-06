'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Phone, Mail, MapPin, Pencil, Trash2, Share2, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { format } from 'date-fns'

export default function DoctorDetailsPage() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const params = useParams()
  const [doctor, setDoctor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [prevAppointments, setPrevAppointments] = useState<any[]>([])

  // Fetch doctor details
  useEffect(() => {
    async function fetchDoctorDetails() {
      if (!supabase || !params.id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error('Doctor not found');
        }

        setDoctor(data);
        
        // Fetch related data
        await Promise.all([
          fetchAppointments(),
          fetchPatients(),
          fetchPreviousAppointments()
        ]);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        toast.error('Failed to load doctor data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDoctorDetails();
  }, [supabase, params.id]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          notes,
          type,
          patients (
            id,
            first_name,
            last_name,
            nickname
          )
        `)
        .eq('doctor_id', parseInt(params.id as string))
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5);

      if (error) throw error;
      console.log('Fetched appointments:', data);
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_doctors')
        .select(`
          patients (
            id,
            first_name,
            last_name,
            nickname
          )
        `)
        .eq('doctor_id', params.id);

      if (error) throw error;
      setPatients(data?.map(item => item.patients) || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const fetchPreviousAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          type,
          patients (
            id,
            first_name,
            last_name,
            nickname
          )
        `)
        .eq('doctor_id', parseInt(params.id as string))
        .lt('date', new Date().toISOString())
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPrevAppointments(data || []);
    } catch (error) {
      console.error('Error fetching previous appointments:', error);
      toast.error('Failed to load previous appointments');
    }
  };

  const handleDeleteDoctor = async () => {
    if (deleteConfirmName !== `${doctor.first_name} ${doctor.last_name}`) {
      toast.error('Please type the doctor name correctly to confirm deletion');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ 
          deleted_at: new Date().toISOString(),
          status: 'deleted'
        })
        .eq('id', params.id);

      if (error) throw error;

      toast.success('Doctor deleted successfully');
      setIsDeleteConfirmOpen(false);
      setIsEditModalOpen(false);
      // Redirect to doctors list after a short delay
      setTimeout(() => {
        window.location.href = '/doctors';
      }, 2000);
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!doctor) {
    return <div>Doctor not found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Dr. {doctor.first_name} {doctor.last_name}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage doctor information and appointments
          </p>
        </div>
      </div>

      <Tabs defaultValue="main" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="main" className="flex-1 sm:flex-none">Main</TabsTrigger>
          <TabsTrigger value="patients" className="flex-1 sm:flex-none">Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-6 mt-0">
          {/* Doctor Info and Appointments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Info Card */}
            <Card className="bg-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Doctor Information</CardTitle>
                  <CardDescription>Basic doctor details and contact information</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="font-medium">Specialization</dt>
                    <dd className="text-muted-foreground">{doctor.specialization}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="font-medium">Contact Number</dt>
                    <dd className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {doctor.contact_number}
                    </dd>
                  </div>
                  {doctor.email && (
                    <div className="flex items-center justify-between">
                      <dt className="font-medium">Email</dt>
                      <dd className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {doctor.email}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="font-medium">Address</dt>
                    <dd className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {doctor.address}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Upcoming Appointments Card */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div>
                    {appointments.length > 0 ? (
                      <Table>
                        <TableBody>
                          {appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <Link 
                                  href={`/appointments/${appointment.id}`}
                                  className="text-foreground hover:text-primary"
                                >
                                  {appointment.patients?.nickname || `${appointment.patients?.first_name} ${appointment.patients?.last_name}`} on {format(new Date(appointment.date), "MMMM d, yyyy")} at {format(new Date(appointment.date), "h:mm a")}
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <p>No upcoming appointments</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Previous Appointments Card */}
            <Card>
              <CardHeader>
                <CardTitle>Previous Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div>
                    {prevAppointments.length > 0 ? (
                      <Table>
                        <TableBody>
                          {prevAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <Link 
                                  href={`/appointments/${appointment.id}`}
                                  className="text-foreground hover:text-primary"
                                >
                                  {appointment.patients?.nickname || `${appointment.patients?.first_name} ${appointment.patients?.last_name}`} on {format(new Date(appointment.date), "MMMM d, yyyy")} at {format(new Date(appointment.date), "h:mm a")}
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <p>No previous appointments</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6 mt-0">
          {/* Patients List */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Patients</CardTitle>
              <CardDescription>List of patients under this doctor's care</CardDescription>
            </CardHeader>
            <CardContent>
              {patients.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          {patient.nickname || `${patient.first_name} ${patient.last_name}`}
                        </TableCell>
                        <TableCell>
                          <Link href={`/patients/${patient.id}`}>
                            <Button variant="ghost" size="sm">View Details</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                  <p>No patients assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Button at Bottom */}
      <div className="flex justify-end pt-6">
        <Button
          variant="destructive"
          onClick={() => {
            setDeleteConfirmName(doctor.first_name + ' ' + doctor.last_name);
            setIsDeleteConfirmOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Doctor
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please type the doctor's full name to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="Type full name to confirm"
              className="w-full p-2 border rounded"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDoctor}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}