import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';

export async function assignDoctorToPatient(patientId: number, doctorId: number) {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error('User is not authenticated');
  }

  const supabase = await createServerSupabaseClient();

  console.log('Current user ID:', userId);

  const { data, error } = await supabase
    .from('patient_doctors')
    .insert([
      {
        patient_id: patientId,
        doctor_id: doctorId,
        user_id: userId,
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) {
    console.error('Error assigning doctor to patient:', error);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    throw error;
  }

  return data;
}