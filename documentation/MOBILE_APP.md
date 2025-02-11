# CareConnect Mobile App Documentation

## Overview
CareConnect Mobile is a React Native application built with Expo, providing a native mobile experience for the CareConnect healthcare platform. The app enables healthcare providers and patients to manage medical records, appointments, and communications through a secure and user-friendly mobile interface.

## Technical Architecture

### Core Technologies
- **Framework**: React Native with Expo SDK
- **Language**: TypeScript
- **State Management**: TanStack Query (React Query)
- **UI Framework**: React Native Paper
- **Navigation**: React Navigation 6.x
- **Backend**: Supabase
- **Authentication**: Supabase Auth + Expo SecureStore
- **Local Storage**: AsyncStorage + SQLite
- **Testing**: Jest + Detox

### Project Structure
```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── contexts/       # React contexts
├── hooks/         # Custom hooks
├── services/      # API and service functions
├── utils/         # Utility functions
├── types/         # TypeScript definitions
├── constants/     # Constants and configuration
└── theme/         # Theming and styling
```

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