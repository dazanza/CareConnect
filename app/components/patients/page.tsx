import PatientsContent from '@/app/components/patients/PatientsContent'

export default function PatientsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Patients</h1>
      <PatientsContent />
    </div>
  )
}