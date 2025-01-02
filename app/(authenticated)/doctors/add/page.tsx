import AddDoctorForm from '@/app/components/AddDoctorForm'
import Link from 'next/link'

export default function AddDoctorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Doctor</h1>
      <AddDoctorForm />
      <Link href="/doctors" className="text-blue-500 hover:underline mt-4 inline-block">
        Back to Doctors
      </Link>
    </div>
  )
}