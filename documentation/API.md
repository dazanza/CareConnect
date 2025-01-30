# API Documentation

## API Architecture

### Core Principles
- RESTful design
- Type safety
- Error handling
- Performance optimization

### Authentication
- Supabase authentication
- JWT tokens
- Session management
- Access control
- Row Level Security (RLS)

### Response Format
```typescript
interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
}
```

## API Routes

### Authentication
```typescript
// Sign In
POST /auth/sign-in
Body: { email: string, password: string }
Response: { user: User, session: Session }

// Sign Up
POST /auth/sign-up
Body: { email: string, password: string, name: string }
Response: { user: User, session: Session }

// Sign Out
POST /auth/sign-out
Response: { success: boolean }

// Reset Password
POST /auth/reset-password
Body: { email: string }
Response: { success: boolean }

// Refresh Session
POST /auth/refresh
Response: { session: Session }
```

### Auth Types
```typescript
interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  user_metadata?: Record<string, any>
}

interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}
```

### Auth Middleware
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  return res
}

### Patients
```typescript
// List Patients
GET /api/patients
Response: (Patient & { shared?: boolean, access_level?: string })[]

// Get Patient
GET /api/patients?id={id}
Response: Patient & { 
  medical_history: MedicalHistory[],
  shared?: boolean,
  access_level?: string 
}

// Create Patient
POST /api/patients
Body: {
  name: string
  date_of_birth: string
  [key: string]: any
}
```

### Doctors
```typescript
// List Doctors
GET /api/doctors
Response: Doctor[]

// Create Doctor
POST /api/doctors
Body: {
  first_name: string
  last_name: string
  specialty: string
  [key: string]: any
}

// Delete Doctor
DELETE /api/doctors?id={id}
Response: { success: true }
```

### Patient-Doctor Relationships
```typescript
// List Patient's Doctors
GET /api/patient-doctors?patientId={id}
Response: {
  id: string
  name: string
  specialization: string
  contact_number: string
  email: string
}[]

// Add Doctor to Patient
POST /api/patient-doctors
Body: {
  patientId: string
  doctorId: string
}
```

### Medical History
```typescript
// List Medical History
GET /api/medical-history?patientId={id}
Response: MedicalHistory[]

// Create Entry
POST /api/medical-history
Body: {
  patient_id: string
  type: string
  title: string
  date: string
  doctor_id?: string
  description?: string
}

// Delete Entry
DELETE /api/medical-history?id={id}
```

### Medications
```typescript
// List Medications
GET /api/medications?patientId={id}
Response: Medication[]

// Create Medication
POST /api/medications
Body: {
  patient_id: string
  doctor_id: string
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date?: string
  status?: 'active' | 'discontinued' | 'completed'
}
```

### Lab Results
```typescript
// List Lab Results
GET /api/lab-results?patientId={id}
Response: LabResult[]

// Create Lab Result
POST /api/lab-results
Body: {
  patient_id: string
  doctor_id: string
  test_name: string
  test_type: string
  result_value: string
  reference_range: string
  unit: string
  date: string
  status?: 'normal' | 'abnormal' | 'critical'
}
```

### Immunizations
```typescript
// List Immunizations
GET /api/immunizations?patientId={id}
Response: Immunization[]

// Create Immunization
POST /api/immunizations
Body: {
  patient_id: string
  doctor_id: string
  vaccine_name: string
  vaccine_type: string
  dose_number: number
  date_administered: string
  administered_by: string
  batch_number: string
  manufacturer: string
  location: string
  status?: 'completed' | 'scheduled' | 'overdue'
}
```

### Allergies
```typescript
// List Allergies
GET /api/allergies?patientId={id}
Response: Allergy[]

// Create Allergy
POST /api/allergies
Body: {
  patient_id: string
  allergen: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
  date_identified: string
}
```

### Vitals
```typescript
// List Vitals
GET /api/vitals?patientId={id}
Response: Vital[]

// Create Vital
POST /api/vitals
Body: {
  patient_id: string
  blood_pressure: string
  heart_rate: number // 30-200
  temperature: number // 35-42
  oxygen_level: number // 70-100
}
```

### Documents
```typescript
// List Documents
GET /api/documents?patientId={id}
Response: Document[]

// Create Document
POST /api/documents
Body: {
  patient_id: string
  name: string
  type: string
  size: number
  url: string
}
```

### Patient Sharing
```typescript
// Create Share Invitation
POST /api/invitations
Body: {
  email: string
  patientId: string
  accessLevel: 'read' | 'write' | 'admin'
}
Response: {
  id: string
  expires_at: string
}
```

## Error Handling

All API routes follow a consistent error handling pattern:

```typescript
// 400 Bad Request
{
  error: string // Descriptive error message
}

// 401 Unauthorized
{
  error: 'Unauthorized'
}

// 500 Internal Server Error
{
  error: 'Failed to [operation description]'
}
```

## Authentication

All API routes require authentication via Supabase Auth. The session token is automatically handled by the Supabase Auth Helpers for Next.js.

## Security

### Row Level Security (RLS)

All database operations are protected by RLS policies that ensure:
- Users can only access their own data
- Shared patients are accessible based on access_level
- All mutations verify proper ownership/access

### Data Validation

Each route implements proper validation:
- Required fields checking
- Data type validation
- Range validation where applicable
- Enumerated value validation

## Type Definitions

### Patient Types
```typescript
interface Patient {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: Address
  medicalHistory: MedicalHistory[]
  createdAt: string
  updatedAt: string
}

interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface MedicalHistory {
  id: number
  condition: string
  diagnosis: string
  treatment: string
  date: string
}
```

### Doctor Types
```typescript
interface Doctor {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  specialization: string
  license: string
  availability: Availability[]
  createdAt: string
  updatedAt: string
}

interface Availability {
  day: string
  startTime: string
  endTime: string
  isAvailable: boolean
}
```

### Appointment Types
```typescript
interface Appointment {
  id: number
  patientId: number
  doctorId: number
  date: string
  time: string
  type: string
  status: AppointmentStatus
  notes: string
  createdAt: string
  updatedAt: string
}

type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'
```

### Document Types
```typescript
interface Document {
  id: number
  name: string
  type: string
  size: number
  url: string
  patientId: number
  doctorId: number
  createdAt: string
  updatedAt: string
}
```

## Error Handling

### Error Codes
```typescript
enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}
```

### Error Responses
```typescript
interface ErrorResponse {
  code: ErrorCode
  message: string
  details?: Record<string, string[]>
}
```

### Error Examples
```typescript
// Unauthorized
{
  code: 'UNAUTHORIZED',
  message: 'Invalid credentials'
}

// Not Found
{
  code: 'NOT_FOUND',
  message: 'Patient not found'
}

// Validation Error
{
  code: 'VALIDATION_ERROR',
  message: 'Invalid input',
  details: {
    email: ['Invalid email format']
  }
}
```

## Authentication

### JWT Token
```typescript
interface JwtPayload {
  sub: string
  email: string
  role: string
  exp: number
}
```

### Auth Headers
```typescript
// Request headers
{
  'Authorization': 'Bearer ${token}'
}
```

### Auth Middleware
```typescript
async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) throw new Error('No token provided')
    
    const decoded = verifyToken(token)
    req.user = decoded
    
    next()
  } catch (error) {
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Invalid token'
    })
  }
}
```

## Rate Limiting

### Configuration
```typescript
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}
```

### Headers
```typescript
// Response headers
{
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Remaining': '99',
  'X-RateLimit-Reset': '1625097600000'
}
```

## Caching

### Cache Control
```typescript
// Response headers
{
  'Cache-Control': 'public, max-age=31536000'
}
```

### Cache Keys
```typescript
const cacheKeys = {
  patients: 'patients',
  doctors: 'doctors',
  appointments: 'appointments'
}
```

## Validation

### Request Validation
```typescript
interface ValidationSchema {
  [key: string]: {
    type: string
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
  }
}
```

### Validation Middleware
```typescript
function validateRequest(schema: ValidationSchema) {
  return (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
    const errors = validate(req.body, schema)
    if (errors) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: errors
      })
    } else {
      next()
    }
  }
}
```

## API Testing

### Test Setup
```typescript
describe('API Tests', () => {
  beforeAll(async () => {
    // Setup test database
  })
  
  afterAll(async () => {
    // Cleanup
  })
})
```

### Request Tests
```typescript
describe('GET /api/patients', () => {
  it('returns patients list', async () => {
    const response = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token}`)
    
    expect(response.status).toBe(200)
    expect(response.body.data).toBeDefined()
  })
})
```

### Error Tests
```typescript
describe('Error Handling', () => {
  it('handles unauthorized access', async () => {
    const response = await request(app)
      .get('/api/patients')
    
    expect(response.status).toBe(401)
    expect(response.body.code).toBe('UNAUTHORIZED')
  })
})
```

## API Documentation

### OpenAPI Specification
```yaml
openapi: 3.0.0
info:
  title: API Documentation
  version: 1.0.0
paths:
  /api/patients:
    get:
      summary: List patients
      parameters:
        - name: page
          in: query
          schema:
            type: integer
      responses:
        200:
          description: Success
```

### API Examples
```typescript
// Example requests
fetch('/api/patients', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// Example responses
{
  data: Patient[]
  meta: {
    page: 1,
    total: 100
  }
}
```

## Performance

### Query Optimization
```typescript
// Optimized query
const query = {
  select: ['id', 'name', 'email'],
  where: { active: true },
  limit: 10
}
```

### Response Compression
```typescript
// Compression middleware
app.use(compression())
```

### Batch Operations
```typescript
// Batch create
POST /api/patients/batch
Body: Patient[]

// Batch update
PUT /api/patients/batch
Body: { ids: number[], data: Partial<Patient> }
```

## Security

### CORS Configuration
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### Input Sanitization
```typescript
function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '')
}
```

### Security Headers
```typescript
// Response headers
{
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
}
``` 