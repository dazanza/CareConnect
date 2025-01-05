import AddPatientForm from '@/app/components/AddPatientForm'
import { Link } from '@/components/ui/link'

export default function AddPatientPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Patient</h1>
      <AddPatientForm />
      <Link href="/patients" className="text-blue-500 hover:underline mt-4 inline-block">
        Back to Patients
      </Link>
    </div>
  )
}