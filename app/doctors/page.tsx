import DoctorsContent from '@/app/components/doctors/DoctorsContent'

export default function DoctorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Doctors</h1>
      <DoctorsContent />
    </div>
  )
}