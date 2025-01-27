import { SupabaseClient } from '@supabase/supabase-js';

// Types for appointment validation and conflict checking
interface AppointmentConflict {
  type: 'doctor' | 'patient';  // Indicates whether the conflict is with a doctor's or patient's schedule
  existingAppointment: {
    id: number;
    date: string;
    patientName?: string;  // Only present for doctor conflicts
    doctorName?: string;   // Only present for patient conflicts
  };
  message: string;  // Human-readable conflict description
}

interface ValidationResult {
  isValid: boolean;        // Whether the proposed appointment time is valid
  conflicts: AppointmentConflict[];  // List of any scheduling conflicts found
}

// Base interface for appointment data from database
interface DatabaseAppointment {
  id: number;
  date: string;
}

// Type for doctor's appointments with associated patient info
interface DoctorAppointmentResponse extends DatabaseAppointment {
  patients: {
    first_name: string;
    last_name: string;
  };
}

// Type for patient's appointments with associated doctor info
interface PatientAppointmentResponse extends DatabaseAppointment {
  doctors: {
    first_name: string;
    last_name: string;
  };
}

// Calculate the time window for checking appointment conflicts
// Returns start and end times based on appointment duration
function getTimeWindow(date: Date, durationMinutes: number = 30) {
  const startTime = new Date(date);
  const endTime = new Date(date);
  startTime.setMinutes(startTime.getMinutes() - durationMinutes);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);
  return { startTime, endTime };
}

// Safely transform raw database response to typed doctor appointment
// Returns null if required fields are missing
function transformDoctorAppointment(apt: any): DoctorAppointmentResponse | null {
  if (!apt?.id || !apt?.date || !apt?.patients?.first_name || !apt?.patients?.last_name) {
    return null;
  }
  return {
    id: apt.id,
    date: apt.date,
    patients: {
      first_name: apt.patients.first_name,
      last_name: apt.patients.last_name
    }
  };
}

// Safely transform raw database response to typed patient appointment
// Returns null if required fields are missing
function transformPatientAppointment(apt: any): PatientAppointmentResponse | null {
  if (!apt?.id || !apt?.date || !apt?.doctors?.first_name || !apt?.doctors?.last_name) {
    return null;
  }
  return {
    id: apt.id,
    date: apt.date,
    doctors: {
      first_name: apt.doctors.first_name,
      last_name: apt.doctors.last_name
    }
  };
}

// Main validation function to check for appointment conflicts
export async function findConflictingAppointments(
  supabase: SupabaseClient,
  {
    doctorId,
    patientId,
    proposedDate,
    durationMinutes = 30,
    excludeAppointmentId
  }: {
    doctorId: number;
    patientId: number;
    proposedDate: Date;
    durationMinutes?: number;
    excludeAppointmentId?: number;
  }
): Promise<ValidationResult> {
  const { startTime, endTime } = getTimeWindow(proposedDate, durationMinutes);
  const conflicts: AppointmentConflict[] = [];

  // Check for conflicts with doctor's existing appointments
  const { data: doctorAppointments, error: doctorError } = await supabase
    .from('appointments')
    .select(`
      id,
      date,
      patients!inner (
        first_name,
        last_name
      )
    `)
    .eq('doctor_id', doctorId)
    .gte('date', startTime.toISOString())
    .lte('date', endTime.toISOString())
    .neq('status', 'cancelled')
    .order('date', { ascending: true });

  if (doctorError) throw doctorError;

  // Transform and filter doctor's appointments, excluding the one being rescheduled
  const conflictingDoctorAppts = (doctorAppointments || [])
    .map(transformDoctorAppointment)
    .filter((apt): apt is DoctorAppointmentResponse => 
      apt !== null && (!excludeAppointmentId || apt.id !== excludeAppointmentId)
    );

  if (conflictingDoctorAppts.length > 0) {
    const appointment = conflictingDoctorAppts[0];
    conflicts.push({
      type: 'doctor',
      existingAppointment: {
        id: appointment.id,
        date: appointment.date,
        patientName: `${appointment.patients.first_name} ${appointment.patients.last_name}`
      },
      message: `Doctor has another appointment at ${new Date(appointment.date).toLocaleTimeString()}`
    });
  }

  // Check for conflicts with patient's existing appointments
  const { data: patientAppointments, error: patientError } = await supabase
    .from('appointments')
    .select(`
      id,
      date,
      doctors!inner (
        first_name,
        last_name
      )
    `)
    .eq('patient_id', patientId)
    .gte('date', startTime.toISOString())
    .lte('date', endTime.toISOString())
    .neq('status', 'cancelled')
    .order('date', { ascending: true });

  if (patientError) throw patientError;

  // Transform and filter patient's appointments, excluding the one being rescheduled
  const conflictingPatientAppts = (patientAppointments || [])
    .map(transformPatientAppointment)
    .filter((apt): apt is PatientAppointmentResponse => 
      apt !== null && (!excludeAppointmentId || apt.id !== excludeAppointmentId)
    );

  if (conflictingPatientAppts.length > 0) {
    const appointment = conflictingPatientAppts[0];
    conflicts.push({
      type: 'patient',
      existingAppointment: {
        id: appointment.id,
        date: appointment.date,
        doctorName: `Dr. ${appointment.doctors.first_name} ${appointment.doctors.last_name}`
      },
      message: `Patient has another appointment at ${new Date(appointment.date).toLocaleTimeString()}`
    });
  }

  return {
    isValid: conflicts.length === 0,
    conflicts
  };
}

// Helper function to format validation errors for display
export function formatValidationErrors(conflicts: AppointmentConflict[]): string {
  return conflicts.map(conflict => {
    if (conflict.type === 'doctor') {
      return `Doctor is not available at this time. ${conflict.message}${
        conflict.existingAppointment.patientName 
          ? ` with ${conflict.existingAppointment.patientName}`
          : ''
      }`;
    } else {
      return `