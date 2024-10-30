interface BloodPressure {
  systolic: number;
  diastolic: number;
}

export function parseBloodPressure(bp: string | null): BloodPressure | null {
  if (!bp) return null;
  
  // Handle formats like "120/80" or "120 / 80"
  const values = bp.split('/').map(v => parseInt(v.trim()));
  
  if (values.length === 2 && !isNaN(values[0]) && !isNaN(values[1])) {
    return {
      systolic: values[0],
      diastolic: values[1]
    };
  }
  
  return null;
}

export function formatBloodPressure(bp: string | null): string {
  if (!bp) return 'N/A';
  
  const parsed = parseBloodPressure(bp);
  if (!parsed) return 'Invalid';
  
  return `${parsed.systolic}/${parsed.diastolic}`;
}

interface VitalReading {
  date_time: string;
  blood_pressure?: string | null;
  heart_rate?: number | null;
  temperature?: number | null;
  oxygen_saturation?: number | null;
  blood_sugar?: number | null;
}

interface ChartData {
  date: string;
  value: number;
}

export function transformVitalsForChart(
  vitals: VitalReading[], 
  vitalType: keyof Omit<VitalReading, 'date_time'>
): ChartData[] {
  return vitals
    .filter(v => {
      if (vitalType === 'blood_pressure') {
        return v.blood_pressure && parseBloodPressure(v.blood_pressure);
      }
      return v[vitalType] != null;
    })
    .map(v => {
      let value: number;
      
      if (vitalType === 'blood_pressure') {
        const bp = parseBloodPressure(v.blood_pressure!);
        value = bp ? bp.systolic : 0; // Using systolic for charting
      } else {
        value = v[vitalType] as number;
      }
      
      return {
        date: new Date(v.date_time).toLocaleDateString(),
        value
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}