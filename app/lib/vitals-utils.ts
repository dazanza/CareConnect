interface BloodPressure {
  systolic: number
  diastolic: number
}

export function parseBloodPressure(bp: string): BloodPressure | null {
  if (!bp) return null

  // Handle formats like "120/80" or "120 / 80"
  const match = bp.match(/(\d+)\s*\/\s*(\d+)/)
  if (!match) return null

  const systolic = parseInt(match[1])
  const diastolic = parseInt(match[2])

  // Validate ranges
  if (systolic < 70 || systolic > 200 || diastolic < 40 || diastolic > 130) {
    return null
  }

  return { systolic, diastolic }
}

export function formatBloodPressure(bp: BloodPressure | null): string {
  if (!bp) return '--'
  return `${bp.systolic}/${bp.diastolic}`
}

export function transformVitalsForChart(vitals: any[]) {
  return vitals.map(vital => {
    const bp = parseBloodPressure(vital.blood_pressure)
    return {
      ...vital,
      blood_pressure_systolic: bp?.systolic,
      blood_pressure_diastolic: bp?.diastolic,
    }
  })
}
