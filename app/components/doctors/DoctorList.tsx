import { Doctor } from '@/types/doctor'

interface DoctorListProps {
  doctors: Doctor[]
}

export function DoctorList({ doctors }: DoctorListProps) {
  if (doctors.length === 0) {
    return <p>No doctors found. Add a new doctor to get started.</p>
  }

  return (
    <ul className="space-y-4">
      {doctors.map((doctor) => (
        <li key={doctor.id} className="border p-4 rounded-md">
          <h2 className="font-bold">{`${doctor.first_name} ${doctor.last_name}`}</h2>
          <p>Specialization: {doctor.specialization}</p>
          <p>Contact: {doctor.contact_number}</p>
          {doctor.email && <p>Email: {doctor.email}</p>}
        </li>
      ))}
    </ul>
  )
}