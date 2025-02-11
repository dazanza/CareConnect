# CareConnect Mobile App Documentation

## Overview
CareConnect Mobile is a React Native application built with Expo, providing a native mobile experience for the CareConnect healthcare platform. The app enables healthcare providers and patients to manage medical records, appointments, and communications through a secure and user-friendly mobile interface.

## Features

### Medical Records System
The medical records system provides comprehensive management of patient medical records with the following features:

#### Core Functionality
- **Record Management**: Create, view, edit, and delete medical records
- **Categorization**: Organize records by type (lab, imaging, procedure, consultation, other)
- **Search & Filter**: Advanced search with multiple filter options
- **Attachment Support**: Upload and manage document attachments
- **Version Control**: Track record changes and maintain version history

#### Security & Permissions
- Row Level Security (RLS) policies for data access
- Role-based access control
- Secure attachment storage
- Audit logging for all operations
- Data encryption at rest and in transit

#### Components
```typescript
// Medical record list with filtering and sorting
<MedicalRecordsList
  patientId={number}
  onRecordPress={(record: MedicalRecord) => void}
/>

// Detailed record view with attachment handling
<MedicalRecordDetail
  record={MedicalRecord}
  onEdit={() => void}
  onDelete={() => void}
  onBack={() => void}
/>

// Create/edit form with validation
<MedicalRecordForm
  patientId={number}
  record={MedicalRecord}
  onSubmit={(record: MedicalRecord) => void}
  onCancel={() => void}
/>
```

#### Data Model
```typescript
interface MedicalRecord {
  id: string;
  patient_id: number;
  category: 'lab' | 'imaging' | 'procedure' | 'consultation' | 'other';
  title: string;
  date: string;
  provider: string;
  status: 'active' | 'archived' | 'pending';
  description?: string;
  location?: string;
  attachments: Array<{
    id: string;
    type: string;
    url: string;
    size: number;
    name: string;
    uploaded_at: string;
  }>;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
```

### Patient Management
- Patient profiles
- Medical history
- Appointment scheduling
- Document management

### Authentication System
- Email/password authentication
- Biometric authentication
- Password reset functionality
- Session management

### Offline Support
- Data caching
- Background sync
- Conflict resolution
- Queue management

## Technical Architecture

### Core Technologies
- **Framework**: React Native with Expo SDK
- **Language**: TypeScript
- **State Management**: TanStack Query
- **Database**: Supabase
- **Authentication**: Supabase Auth + Expo SecureStore
- **UI Components**: React Native Paper
- **Navigation**: React Navigation 6.x
- **Form Handling**: React Hook Form + Zod
- **File Handling**: Expo Document Picker + FileSystem

### Project Structure
```
src/
├── components/
│   ├── medical-records/
│   │   ├── MedicalRecordsList.tsx
│   │   ├── MedicalRecordDetail.tsx
│   │   └── MedicalRecordForm.tsx
│   └── ui/
├── screens/
├── services/
│   └── medicalRecords.ts
├── types/
│   └── medicalRecords.ts
├── hooks/
├── utils/
└── lib/
```

### Database Schema
```sql
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    provider TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT,
    location TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
```

## Security Measures

### Data Protection
- End-to-end encryption
- Secure file storage
- Access control policies
- Audit logging

### Authentication
- Multi-factor authentication
- Biometric support
- Session management
- Token refresh

### Compliance
- HIPAA compliance
- Data privacy
- Security auditing
- Access monitoring

## Development Guidelines

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Jest for testing

### Component Guidelines
- Functional components
- React hooks
- Proper error handling
- Loading states

### State Management
- React Query for server state
- Context for app state
- Proper caching
- Optimistic updates

## Testing Strategy

### Unit Testing
- Component tests
- Service tests
- Utility tests
- Form validation

### Integration Testing
- API integration
- Navigation flows
- Data persistence
- Offline functionality

### E2E Testing
- User flows
- Authentication
- Data management
- File handling

## Deployment

### Build Process
- Expo EAS Build
- App signing
- Asset optimization
- Version management

### App Store
- iOS App Store
- Google Play Store
- Beta distribution
- Update management

## Monitoring

### Performance
- Load times
- Memory usage
- Network calls
- Error rates

### Analytics
- User engagement
- Feature usage
- Error tracking
- Performance metrics

## Support

### Documentation
- API reference
- Component library
- Setup guide
- User manual

### Troubleshooting
- Common issues
- Error codes
- Debug tools
- Support contacts

## Features

### Authentication
- Email/password login
- Secure token storage
- Session management
- Password reset
- Biometric authentication (planned)

### Patient Management
- Patient list with search and filters
- Patient creation and editing
- Comprehensive patient details view
- Offline support
- Image upload and management

### Patient Details Components
All components support offline functionality and optimistic updates:

1. **PatientSummary**
   - Contact information
   - Medical overview
   - Recent activity
   - Latest lab results
   - Quick stats

2. **AllergiesList**
   - Severity indicators
   - Reaction tracking
   - Status management
   - Notes and history

3. **ImmunizationsList**
   - Vaccine tracking
   - Dose management
   - Schedule tracking
   - Side effects monitoring

4. **LabResultsList**
   - Result visualization
   - Reference ranges
   - Status tracking
   - Doctor annotations

5. **MedicalHistoryList**
   - Chronological timeline
   - Event categorization
   - Doctor attribution
   - Detailed descriptions

6. **DocumentsList**
   - Document preview
   - Version tracking
   - Category organization
   - Download management

7. **MedicationsList**
   - Active medications
   - Dosage tracking
   - Adherence monitoring
   - Side effects tracking

8. **NotesList**
   - Clinical notes
   - Voice recordings
   - Transcriptions
   - Event linking

### Data Management
- Offline-first architecture
- Optimistic updates
- Background sync
- Conflict resolution
- Data validation
- Error handling

### Upcoming Features

#### Patient Interactions
- Secure messaging
- Appointment scheduling
- Telemedicine support
- Document sharing
- Real-time notifications

#### Search Capabilities
- Advanced filters
- Full-text search
- Voice search
- OCR for documents
- Search history
- Saved searches

#### Performance
- Lazy loading
- Image caching
- Query optimization
- Request batching
- Connection resilience

#### Security
- Biometric authentication
- Audit logging
- Session management
- Data encryption
- Access control
- Rate limiting

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Add comprehensive documentation
- Write unit tests

### Performance
- Implement virtualized lists
- Optimize image loading
- Use proper caching
- Minimize re-renders
- Monitor memory usage

### Security
- Secure data storage
- Encrypt sensitive data
- Implement proper authentication
- Add audit logging
- Follow HIPAA guidelines

### Testing
- Unit tests for components
- Integration tests
- E2E testing with Detox
- Performance testing
- Security testing

## Getting Started

### Prerequisites
- Node.js 16+
- Expo CLI
- iOS Simulator/Android Emulator
- Supabase account

### Installation
1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Start the development server

### Development
1. Follow TypeScript guidelines
2. Use React Native Paper components
3. Implement offline support
4. Add proper error handling
5. Write comprehensive tests

## Deployment
- Configure app signing
- Set up CI/CD pipeline
- Prepare store assets
- Submit to app stores
- Monitor performance

## Support
- Technical documentation
- API references
- Troubleshooting guides
- Security guidelines
- Contribution guide

## Authentication System

### Features
- Email/password authentication
- Biometric authentication (Face ID/Touch ID)
- Secure credential storage
- Password reset functionality
- Session management
- Offline authentication support

### Authentication Flow
1. User opens app
2. Check for existing session
3. If session exists:
   - Validate session
   - Redirect to Dashboard
4. If no session:
   - Show Welcome screen
   - User can choose to:
     - Sign in
     - Register
     - Reset password

### Biometric Authentication
- Device compatibility check
- Support for Face ID and Touch ID
- Secure credential storage
- Optional setup during onboarding
- Fallback to password authentication

## Security Measures

### Data Protection
- Encrypted local storage
- Secure credential management
- Certificate pinning
- Session token management
- Biometric security

### Compliance
- HIPAA compliance
- Data privacy regulations
- Audit logging
- Access control

## Offline Capabilities

### Data Sync
- Offline-first architecture
- Background sync
- Conflict resolution
- Queue management for offline actions

### Local Storage
- AsyncStorage for app data
- SecureStore for sensitive information
- SQLite for structured data
- File system for documents

## User Interface

### Design System
- Platform-specific components
- Consistent styling
- Dark mode support
- Accessibility features
- Responsive layouts

### Navigation
- Stack navigation for auth flow
- Tab navigation for main app
- Modal presentations
- Deep linking support

## Performance Optimization

### Loading States
- Skeleton screens
- Progressive loading
- Lazy loading
- Image optimization

### Memory Management
- Resource cleanup
- Cache management
- Background task optimization
- Memory usage monitoring

## Development Guide

### Environment Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Create `.env` file
   - Set Supabase credentials
   - Configure other API keys

3. Start development server:
   ```bash
   npm run ios     # For iOS
   npm run android # For Android
   ```

### Testing
- Unit tests with Jest
- Integration tests with Detox
- Manual testing checklist
- Performance testing guidelines

### Building & Deployment
- EAS Build configuration
- App signing setup
- Store deployment process
- CI/CD pipeline

## API Integration

### Supabase Integration
- Authentication endpoints
- Real-time subscriptions
- Data synchronization
- File storage

### Error Handling
- Network error handling
- Offline error states
- User feedback
- Error reporting

## Monitoring & Analytics

### Performance Monitoring
- Load time tracking
- Error tracking
- Usage analytics
- Crash reporting

### User Analytics
- Session tracking
- Feature usage
- User engagement
- Conversion tracking

## Troubleshooting

### Common Issues
1. Authentication errors
2. Sync conflicts
3. Performance issues
4. Build problems

### Debug Tools
- React Native Debugger
- Chrome Developer Tools
- Flipper
- Console logging

## Version History

### Current Version: 1.0.0
- Initial release
- Core authentication system
- Basic offline support
- Essential healthcare features

### Planned Updates
1. Enhanced offline capabilities
2. Advanced biometric features
3. Improved performance
4. Additional platform integrations

## Support & Resources

### Documentation
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [Supabase](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/)

### Support Channels
- GitHub Issues
- Support Email
- Documentation Updates
- Community Forums

## Vitals Management System

### Overview
The vitals management system allows healthcare providers to track and monitor patient vital signs with a comprehensive set of features including data visualization, offline support, and real-time updates.

### Components

#### VitalsDisplay
- Main container component for vitals management
- Displays vital history in both chart and list format
- Supports pull-to-refresh functionality
- Implements optimistic updates for better UX
- Includes warning indicators for abnormal values

#### VitalsChart
- Interactive charts using Victory Native
- Supports multiple vital types:
  - Blood Pressure (systolic/diastolic)
  - Heart Rate
  - Temperature
  - Oxygen Saturation
  - Blood Sugar
- Features:
  - Normal range indicators
  - Interactive tooltips
  - Date-based x-axis
  - Responsive design
  - Custom styling per vital type

#### VitalsEntry
- Form component for adding/editing vitals
- Comprehensive validation using Zod
- Support for all vital types
- Real-time validation feedback
- Modal-based entry interface

### Data Management

#### Offline Support
- Persistent data storage using AsyncStorage
- Query caching with TanStack Query
- Optimistic updates for immediate feedback
- Background sync capabilities
- Conflict resolution handling

#### Data Validation
```typescript
const vitalsSchema = z.object({
  blood_pressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Invalid format (e.g. 120/80)').optional(),
  heart_rate: z.number().min(20).max(220).optional(),
  temperature: z.number().min(35).max(43).optional(),
  oxygen_saturation: z.number().min(50).max(100).optional(),
  blood_sugar: z.number().min(20).max(600).optional(),
  mood: z.string().optional(),
  notes: z.string().optional(),
});
```

#### Normal Ranges
- Blood Pressure: 90-140 mmHg (systolic)
- Heart Rate: 60-100 bpm
- Temperature: 36.1-37.8°C
- Oxygen Saturation: 95-100%
- Blood Sugar: 70-180 mg/dL

### State Management

#### Query Management
- Uses TanStack Query for server state
- Implements optimistic updates
- Handles loading and error states
- Supports background data refetching

#### Offline Persistence
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours cache
      staleTime: 1000 * 60 * 5,    // 5 minutes fresh
      retry: 3,
      refetchOnReconnect: true,
      keepPreviousData: true,
    },
  },
});
```

### User Interface

#### Warning System
- Visual indicators for abnormal values
- Color-coded status indicators
- Real-time validation feedback
- Clear error messaging

#### Interactive Features
- Pull-to-refresh functionality
- Modal-based data entry
- Interactive charts with tooltips
- Tap to edit existing entries

### Best Practices

#### Performance
- Optimized chart rendering
- Efficient data caching
- Minimal re-renders
- Background data syncing

#### Security
- Data validation on client and server
- Secure storage of sensitive data
- User authentication checks
- Data access controls

#### Accessibility
- Clear error messages
- Keyboard-friendly inputs
- Screen reader support
- High contrast options

### Future Enhancements
1. Data Export
   - CSV export functionality
   - PDF report generation
   - Share capabilities
   - Data backup options

2. Advanced Analytics
   - Trend analysis
   - Statistical insights
   - Correlation analysis
   - Health score system

3. Notifications
   - Reminder system
   - Alert thresholds
   - Push notifications
   - Critical alerts

### Testing Strategy

#### Unit Tests
- Component rendering tests
- Validation logic tests
- State management tests
- Utility function tests

#### Integration Tests
- Form submission flows
- Data synchronization
- Offline functionality
- Chart interactions

#### E2E Tests
- Complete vital entry flow
- Offline usage scenarios
- Data persistence checks
- UI interaction tests

### Error Handling

#### Network Errors
- Offline detection
- Retry mechanisms
- User feedback
- Data recovery

#### Validation Errors
- Real-time feedback
- Clear error messages
- Recovery suggestions
- Data preservation

### Usage Examples

#### Adding Vitals
```typescript
const handleEntrySuccess = async (vitalsData: VitalsFormData) => {
  try {
    await mutation.mutateAsync({
      ...vitalsData,
      patient_id: patientId,
      user_id: userId,
    });
  } catch (error) {
    console.error('Error saving vitals:', error);
  }
};
```

#### Displaying Charts
```typescript
<VitalsChart
  data={vitalsHistory}
  type="blood_pressure"
  title="Blood Pressure"
  yLabel="mmHg"
  normalRange={{ min: 90, max: 140 }}
/>
```

### Troubleshooting Guide

#### Common Issues
1. Offline sync conflicts
2. Data validation errors
3. Chart rendering issues
4. Form submission failures

#### Solutions
1. Manual sync trigger
2. Data validation check
3. Chart reload
4. Error recovery steps

## Patient Management System

### Overview
The patient management system provides a comprehensive mobile interface for managing patient records, with full offline support and real-time synchronization.

### Components

#### PatientList
- Main container component for patient management
- Features:
  - Virtualized list using FlashList for performance
  - Pull-to-refresh functionality
  - Real-time search capabilities
  - Offline data access
  - Loading skeletons
  - Error handling
  - Empty states
  - FAB for adding new patients

```typescript
// Example usage of PatientList
<PatientList />
```

#### PatientListSkeleton
- Loading state component for patient list
- Animated skeleton UI
- Matches exact layout of patient cards
- Provides visual feedback during data fetching

```typescript
// Example of skeleton loading state
<PatientListSkeleton />
```

### Data Management

#### Offline Support
```typescript
// Query configuration with offline support
const patientQueryConfig = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  cacheTime: 1000 * 60 * 60 * 24, // 24 hours
};

// Offline-first data fetching
const { data, isLoading } = usePatients({
  queryKey: ['patients'],
  queryFn: fetchPatients,
  ...patientQueryConfig,
});
```

#### Optimistic Updates
```typescript
// Optimistic update pattern
const mutation = useMutation({
  mutationFn: updatePatient,
  onMutate: async (newData) => {
    // Cancel queries
    await queryClient.cancelQueries(['patients']);
    
    // Snapshot previous state
    const previousData = queryClient.getQueryData(['patients']);
    
    // Optimistically update
    queryClient.setQueryData(['patients'], old => ({
      ...old,
      ...newData
    }));
    
    return { previousData };
  },
  onError: (err, newData, context) => {
    // Roll back on error
    queryClient.setQueryData(['patients'], context.previousData);
  }
});
```

### UI Components

#### Skeleton Loading
```typescript
// Reusable skeleton component
interface SkeletonProps {
  width: number | `${number}%` | 'auto';
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton = ({ width, height, borderRadius = 4, style }: SkeletonProps) => {
  // Implementation
};
```

#### List Virtualization
```typescript
// FlashList implementation for efficient list rendering
<FlashList
  data={patients}
  renderItem={renderPatient}
  estimatedItemSize={120}
  onRefresh={onRefresh}
  refreshing={refreshing}
/>
```

### State Management

#### Query Management
- Uses TanStack Query for server state
- Implements optimistic updates
- Handles loading and error states
- Supports background data refetching

#### Offline Persistence
```typescript
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'CARE_CONNECT_QUERY_CACHE',
});

// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 5,
      retry: 3,
      refetchOnReconnect: true,
      keepPreviousData: true,
    },
  },
});
```

### Best Practices

#### Performance
- List virtualization with FlashList
- Optimistic updates for better UX
- Efficient data caching
- Background sync
- Minimal re-renders

#### Error Handling
- Comprehensive error states
- Retry mechanisms
- Offline fallbacks
- User feedback
- Error boundaries

#### Accessibility
- Clear error messages
- Loading indicators
- Touch-friendly targets
- Pull-to-refresh
- Search functionality

### Future Enhancements
1. Patient Forms
   - Mobile-optimized layout
   - Camera integration
   - Form validation
   - Progress tracking
   - Offline support

2. Patient Details
   - Tabbed interface
   - Swipeable navigation
   - Floating actions
   - Activity history
   - Related data

3. Search Enhancements
   - Advanced filters
   - Voice search
   - Recent searches
   - Search history
   - Sort options

### Testing Strategy

#### Unit Tests
```typescript
describe('PatientList', () => {
  it('renders loading state', () => {
    // Test loading skeleton
  });

  it('handles offline data', () => {
    // Test offline functionality
  });

  it('implements search', () => {
    // Test search functionality
  });
});
```

#### Integration Tests
- List rendering
- Search functionality
- Offline sync
- Data persistence
- Navigation flow

#### E2E Tests
- Complete patient flow
- Offline scenarios
- Search and filter
- Error handling
- Data sync

### Error Handling

#### Network Errors
- Offline detection
- Retry mechanisms
- Cache fallback
- User feedback
- Data recovery

#### Validation Errors
- Form validation
- Data consistency
- Error messages
- Recovery options
- Data preservation

### Usage Examples

#### Basic Usage
```typescript
// Patient list with search
const PatientScreen = () => (
  <View style={styles.container}>
    <PatientList />
  </View>
);
```

#### With Search
```typescript
// Patient list with custom search
const PatientScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search patients"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
      <PatientList searchQuery={searchQuery} />
    </View>
  );
};
```

### Troubleshooting Guide

#### Common Issues
1. Offline sync conflicts
2. Search performance
3. List rendering issues
4. Data persistence errors

#### Solutions
1. Manual sync trigger
2. Clear search cache
3. Reset list state
4. Clear persistence storage 