interface PrescriptionStats {
  totalPrescriptions: number
  activePrescriptions: number
  upcomingRefills: number
  expiringPrescriptions: number
  byStatus: {
    active: number
    completed: number
    discontinued: number
  }
  commonMedications: Array<{
    medication: string
    count: number
  }>
}

interface Prescription {
  id: number
  medication: string
  status: 'active' | 'completed' | 'discontinued'
  start_date: string
  end_date?: string
  refills: number
}

export function calculatePrescriptionStats(prescriptions: Prescription[]): PrescriptionStats {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Initialize stats
  const stats: PrescriptionStats = {
    totalPrescriptions: prescriptions.length,
    activePrescriptions: 0,
    upcomingRefills: 0,
    expiringPrescriptions: 0,
    byStatus: {
      active: 0,
      completed: 0,
      discontinued: 0,
    },
    commonMedications: [],
  }

  // Count medications
  const medicationCounts = new Map<string, number>()

  prescriptions.forEach(prescription => {
    // Count by status
    stats.byStatus[prescription.status]++

    // Count active prescriptions
    if (prescription.status === 'active') {
      stats.activePrescriptions++

      // Count prescriptions expiring soon
      if (prescription.end_date) {
        const endDate = new Date(prescription.end_date)
        if (endDate <= thirtyDaysFromNow && endDate >= now) {
          stats.expiringPrescriptions++
        }
      }

      // Count prescriptions needing refills
      if (prescription.refills === 0) {
        stats.upcomingRefills++
      }
    }

    // Count medications
    const count = medicationCounts.get(prescription.medication) || 0
    medicationCounts.set(prescription.medication, count + 1)
  })

  // Get common medications
  stats.commonMedications = Array.from(medicationCounts.entries())
    .map(([medication, count]) => ({ medication, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return stats
} 