# API Documentation

## Authentication

All API endpoints require authentication. The application uses Supabase Auth, and requests must include a valid session cookie.

## Error Handling

All endpoints follow a consistent error response format:

```typescript
{
  error: string;  // Error message
}
```

HTTP Status codes:
- 200: Success
- 400: Bad Request (invalid input)
- 401: Unauthorized (no valid session)
- 403: Forbidden (insufficient permissions)
- 500: Internal Server Error

## Endpoints

### Patients

#### GET /api/patients
Fetch patients for the authenticated user.

**Query Parameters:**
- None

**Response:**
```typescript
{
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  // ... other patient fields
}[]
```

#### POST /api/patients
Create a new patient.

**Request Body:**
```typescript
{
  name: string;
  date_of_birth: string;
  // Optional fields
  email?: string;
  phone?: string;
  address?: string;
}
```

### Doctors

#### GET /api/doctors
Fetch doctors for the authenticated user.

**Response:**
```typescript
{
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  // ... other doctor fields
}[]
```

#### POST /api/doctors
Create a new doctor.

**Request Body:**
```typescript
{
  first_name: string;
  last_name: string;
  specialty: string;
  // Optional fields
  email?: string;
  phone?: string;
}
```

### Prescriptions

#### GET /api/prescriptions
Fetch prescriptions with optional filtering.

**Query Parameters:**
- `patientId?: string` - Filter by patient
- `status?: 'active' | 'completed' | 'discontinued'` - Filter by status
- `startDate?: string` - Filter by start date

**Response:**
```typescript
{
  id: number;
  medication: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  refills: number;
  status: 'active' | 'completed' | 'discontinued';
  notes?: string;
  patient: {
    id: number;
    name: string;
    nickname?: string;
  };
  doctor: {
    id: number;
    name: string;
  };
}[]
```

#### POST /api/prescriptions
Create new prescriptions.

**Request Body:**
```typescript
{
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    refills: number;
    notes?: string;
  }>;
  patient_id: number;
  prescribed_by: number;
  start_date: string;
  end_date?: string;
  appointment_id?: number;
  log_id?: number;
  notes?: string;
  status?: 'active' | 'completed' | 'discontinued';
}
```

### Lab Results

#### GET /api/lab-results
Fetch lab results for a patient.

**Query Parameters:**
- `patientId: string` (required)

**Response:**
```typescript
{
  id: number;
  patient_id: number;
  test_name: string;
  test_type: string;
  result_value: string;
  unit: string;
  reference_range: string;
  status: 'normal' | 'abnormal' | 'critical';
  date: string;
  doctor: {
    id: number;
    name: string;
  };
}[]
```

#### POST /api/lab-results
Create a new lab result.

**Request Body:**
```typescript
{
  patient_id: number;
  doctor_id: number;
  test_name: string;
  test_type: string;
  result_value: string;
  reference_range: string;
  unit: string;
  date: string;
  status?: 'normal' | 'abnormal' | 'critical';
}
```

### Vitals

#### GET /api/vitals
Fetch vitals for a patient.

**Query Parameters:**
- `patientId: string` (required)

**Response:**
```typescript
{
  id: number;
  patient_id: number;
  blood_pressure: string;
  heart_rate: number;
  temperature: number;
  oxygen_level: number;
  date_time: string;
}[]
```

#### POST /api/vitals
Record new vitals.

**Request Body:**
```typescript
{
  patient_id: number;
  blood_pressure: string;  // Format: "120/80"
  heart_rate: number;      // Range: 30-200
  temperature: number;     // Range: 35-42 (Celsius)
  oxygen_level: number;    // Range: 70-100
}
```

### Patient Sharing

#### POST /api/invitations
Send a patient sharing invitation.

**Request Body:**
```typescript
{
  email: string;
  patientId: number;
  accessLevel: 'read' | 'write' | 'admin';
}
```

**Response:**
```typescript
{
  id: number;
  patient_id: number;
  email: string;
  access_level: string;
  expires_at: string;
  // ... other fields
}
```

### Documents

#### GET /api/documents
Fetch documents for a patient.

**Query Parameters:**
- `patientId: string` (required)

**Response:**
```typescript
{
  id: number;
  patient_id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
}[]
```

#### POST /api/documents
Upload a new document.

**Request Body:**
```typescript
{
  patient_id: number;
  name: string;
  type: string;
  size: number;
  url: string;
}
```

## Access Control

- All endpoints verify user authentication via Supabase Auth
- Patient-specific endpoints verify user has access to the patient either directly or through sharing
- Write operations on shared patients require 'write' or 'admin' access level
- Proper error responses are returned for unauthorized access attempts

## Rate Limiting

- Default rate limiting is applied at the infrastructure level
- Specific limits may apply to file uploads and batch operations

## Versioning

Current API version: v1 (implicit in routes)
Future versions will be explicitly versioned: `/api/v2/...` 