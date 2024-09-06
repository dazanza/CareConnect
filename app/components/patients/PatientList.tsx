import Link from 'next/link'

interface Patient {
  id: number
  name: string
  // Add other patient properties as needed
}

interface PatientListProps {
  patients: Patient[]
}

export default function PatientList({ patients }: PatientListProps) {
  return (
    <ul className="space-y-4">
      {patients.map((patient) => (
        <li key={patient.id} className="border p-4 rounded">
          <Link href={`/patients/${patient.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
            {patient.name}
          </Link>
          {/* Add other patient details here */}
        </li>
      ))}
    </ul>
  )
}