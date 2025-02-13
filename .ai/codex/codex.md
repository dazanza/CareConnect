# AI Codex

## Usage

- Review: @codex.md (silent load, no output)
- Update: @learn.md
- File paths: Always use absolute paths from project root

## Errors

E000:

- Context: [Relevant project area or file]
- Error: [Precise description]
- Correction: [Exact fix]
- Prevention: [Specific strategy]
- Related: [IDs of related errors/learnings]

E001:

- Context: File path suggestions
- Error: Relative path used instead of absolute
- Correction: Use absolute paths from project root
- Prevention: Always prefix paths with '/'
- Related: None

E002:

- Context: '/src/index.ts'
- Error: Suggested CommonJS import syntax
- Correction: Use ES module import syntax
- Prevention: Verify `"type": "module"` in '/package.json' or '.mjs' extension
- Related: L002

E003:

- Context: Database schema alignment
- Error: Mismatched types between schema and TypeScript interfaces
- Correction: Update interfaces to exactly match database schema
- Prevention: Always verify schema before creating interfaces
- Related: L077, L078

E004:

- Context: Component prop types
- Error: Missing required prop types in component interfaces
- Correction: Add all required props to component interfaces
- Prevention: Document and type all props before implementation
- Related: L078, L079

E005:

- Context: Form submission types
- Error: Incorrect form data structure for API endpoints
- Correction: Create separate form submission interfaces
- Prevention: Define API types before implementing forms
- Related: L078, L156

E006:

- Context: Toast notification implementation
- Error: Inconsistent toast usage across components
- Correction: Implement standardized toast utility
- Prevention: Use centralized toast utility for all notifications
- Related: L261, L262

E007:

- Context: Next.js configuration
- Error: Deprecated experimental.serverActions configuration
- Correction: Remove experimental.serverActions as it's now default in Next.js 14
- Prevention: Keep up with Next.js documentation for deprecated features
- Related: L276, L277

E008:

- Context: React dependency resolution
- Error: Conflicting peer dependencies with @react-email/components
- Correction: Use --legacy-peer-deps for development environment
- Prevention: Check peer dependencies before adding new packages
- Related: L276, L278

## Learnings

L251:

- Context: Share analytics implementation
- Insight: Proper pattern for tracking share usage and metrics
- Application: Create dedicated analytics service with proper types
- Impact: Enables accurate tracking and reporting of share usage
- Related: L104, L105

L252:

- Context: Document versioning system
- Insight: Efficient storage and retrieval of document versions
- Application: Use metadata table for version tracking
- Impact: Maintains complete document history without duplication
- Related: L249, L250

L253:

- Context: Security monitoring implementation
- Insight: Comprehensive security logging and monitoring
- Application: Track all security-related events with proper context
- Impact: Improves security auditing and incident response
- Related: L110, L111

L254:

- Context: Performance optimization patterns
- Insight: Consistent approach to optimizing components
- Application: Use React.memo and proper dependency management
- Impact: Reduces unnecessary re-renders and improves performance
- Related: L247, L248

L255:

- Context: Testing strategy implementation
- Insight: Comprehensive testing approach for all features
- Application: Combine unit, integration, and E2E tests effectively
- Impact: Ensures proper test coverage and reliability
- Related: None

L256:

- Context: Infrastructure monitoring
- Insight: Proper monitoring of system health and performance
- Application: Implement comprehensive monitoring solution
- Impact: Enables proactive issue detection and resolution
- Related: L253, L254

L257:

- Context: Database optimization
- Insight: Query optimization and indexing strategies
- Application: Create proper indexes and optimize complex queries
- Impact: Improves database performance and reduces load
- Related: L112, L113

L258:

- Context: Component library organization
- Insight: Proper structure for shared component library
- Application: Organize components by domain and functionality
- Impact: Improves component discoverability and reuse
- Related: L029, L250

L259:

- Context: Error handling patterns
- Insight: Consistent error handling across application
- Application: Create centralized error handling system
- Impact: Improves error reporting and user experience
- Related: L114, L253

L260:

- Context: State management patterns
- Insight: Efficient state management with proper types
- Application: Use appropriate state management for each case
- Impact: Improves application stability and maintainability
- Related: L247, L248

L261:

- Context: Toast notification standardization
- Insight: Centralized toast management improves consistency
- Application: Create showToast utility with type-safe methods
- Impact: Ensures consistent user feedback across application
- Related: E006, L262

L262:

- Context: Component toast migration
- Insight: Systematic approach to updating toast implementations
- Application: Update all components to use standardized toast
- Impact: Reduces code duplication and improves maintainability
- Related: E006, L261

L263:

- Context: MedicationManager component
- Insight: Proper database schema alignment for medications
- Application: Update component to match database structure
- Impact: Ensures data consistency and type safety
- Related: E003, L077

L264:

- Context: Form data typing
- Insight: Separate interfaces for form and database types
- Application: Create specific interfaces for form state
- Impact: Improves type safety in form handling
- Related: L078, E005

L265:

- Context: Medication management system
- Insight: Comprehensive approach to medication tracking
- Application: Implement full CRUD with proper types and validation
- Impact: Enables accurate medication tracking and monitoring
- Related: L263, L264

L266:

- Context: Medication form validation
- Insight: Proper validation for medication data
- Application: Use Zod schema for type-safe validation
- Impact: Ensures data integrity and proper error handling
- Related: L264, E005

L267:

- Context: Medication component architecture
- Insight: Separation of concerns in medication management
- Application: Split into manager and form components
- Impact: Improves maintainability and reusability
- Related: L258, L263

L268:

- Context: Medication data relationships
- Insight: Proper handling of medication relationships
- Application: Implement proper foreign key relationships
- Impact: Maintains data consistency across the system
- Related: L257, L263

L276:

- Context: Next.js 14 configuration
- Insight: Server Actions are now available by default
- Application: Remove experimental.serverActions from next.config.js
- Impact: Cleaner configuration and better maintainability
- Related: E007, L277

L277:

- Context: Next.js configuration validation
- Insight: Next.js strictly validates config object types
- Application: Use proper type structure for experimental features
- Impact: Prevents runtime errors from misconfigured options
- Related: E007, L276

L278:

- Context: React dependency management
- Insight: Modern npm peer dependency resolution can be too strict
- Application: Use --legacy-peer-deps for complex React ecosystems
- Impact: Enables development while maintaining package compatibility
- Related: E008, L279

L279:

- Context: Package deprecation handling
- Insight: Several core packages showing deprecation warnings
- Application: Plan migration path for deprecated packages
- Impact: Maintains long-term project maintainability
- Related: L278, E008

L280:

- Context: React Native authentication architecture
- Insight: Combining Supabase Auth with native biometrics requires careful state management
- Application: Created AuthContext with biometric and session handling
- Impact: Enables secure native authentication with offline support
- Related: L263, L264

L281:

- Context: Mobile-specific component adaptation
- Insight: Platform-specific UI patterns require different component structures
- Application: Migrated web components to React Native Paper with proper mobile UX
- Impact: Better native feel and improved mobile user experience
- Related: L258, L267

L282:

- Context: Mobile secure storage strategy
- Insight: Different storage mechanisms needed for different security levels
- Application: AsyncStorage for app data, SecureStore for sensitive info, SQLite for structured data
- Impact: Proper security levels for different data types
- Related: L280, L265

L283:

- Context: React Native navigation patterns
- Insight: Stack-based navigation requires different state management approach
- Application: Implemented conditional navigation stack with auth state
- Impact: Smooth navigation flow with proper security boundaries
- Related: L280, L281

L284:

- Context: Mobile form handling
- Insight: Mobile forms require specific UX considerations
- Application: Implemented KeyboardAvoidingView and proper input focus management
- Impact: Better form usability on mobile devices
- Related: L281, L264

L285:

- Context: Mobile error handling
- Insight: Mobile error states need different presentation patterns
- Application: Created mobile-specific error components with proper feedback
- Impact: More user-friendly error handling on mobile
- Related: L259, L281

L286:

- Context: Mobile vitals visualization
- Insight: Victory Native charts require specific optimization for mobile performance
- Application: Implemented responsive chart sizing and optimized data processing
- Impact: Smooth chart rendering and better user experience on mobile devices
- Related: L281, L254

L287:

- Context: Offline-first data management
- Insight: Combining TanStack Query with AsyncStorage provides robust offline support
- Application: Created persisted query cache with type-safe dehydration/rehydration
- Impact: Seamless offline experience with proper data synchronization
- Related: L282, L280

L288:

- Context: Mobile form validation
- Insight: Zod schema validation with mobile-specific error handling improves UX
- Application: Created reusable validation patterns with mobile-friendly error messages
- Impact: Better user feedback and data integrity on mobile devices
- Related: L284, L266

L289:

- Context: Mobile health data visualization
- Insight: Health data requires specific visualization patterns for mobile screens
- Application: Implemented warning systems and normal range indicators
- Impact: Clear health status visualization on mobile devices
- Related: L286, L281

L290:

- Context: Mobile optimistic updates
- Insight: Mobile networks require robust optimistic update handling
- Application: Implemented type-safe optimistic updates with proper rollback
- Impact: Better perceived performance and data consistency
- Related: L287, L260

L291:

- Context: Mobile health data types
- Insight: Health data requires specific type validation and normalization
- Application: Created comprehensive type system for vital signs
- Impact: Consistent data handling and validation across the app
- Related: L288, L274

L292:

- Context: Mobile chart interaction
- Insight: Touch interactions require specific consideration for medical charts
- Application: Implemented VictoryVoronoiContainer for better touch handling
- Impact: More accurate and user-friendly chart interactions
- Related: L286, L289

L293:

- Context: Mobile health data persistence
- Insight: Health data requires specific persistence strategies
- Application: Implemented selective persistence based on data sensitivity
- Impact: Proper balance of offline availability and security
- Related: L287, L282

L294:

- Context: Mobile health UI patterns
- Insight: Health data visualization requires specific mobile UI patterns
- Application: Created card-based layout with clear warning indicators
- Impact: Better readability and understanding of health data
- Related: L289, L281

L295:

- Context: Mobile chart performance
- Insight: Victory Native charts require specific performance optimizations
- Application: Implemented data processing and memoization strategies
- Impact: Smooth chart rendering with large datasets
- Related: L286, L254

L296:
- Context: Mobile patient details architecture
- Insight: Parallel data fetching with offline support improves performance and UX
- Application: Created centralized service with offline-first approach
- Impact: Better performance and offline reliability
- Related: L287, L280

L297:
- Context: Mobile form handling
- Insight: Platform-specific keyboard handling is crucial for mobile UX
- Application: Created reusable KeyboardAvoidingView pattern
- Impact: Consistent form behavior across platforms
- Related: L284, L281

L298:
- Context: Mobile navigation architecture
- Insight: Conditional navigation stacks improve auth flow and security
- Application: Implemented separate stacks for auth and main app
- Impact: Better security boundaries and navigation flow
- Related: L283, L280

L299:
- Context: Mobile data synchronization
- Insight: Optimistic updates with proper rollback improve perceived performance
- Application: Implemented type-safe optimistic updates with error recovery
- Impact: Better user experience with immediate feedback
- Related: L290, L287

L300:
- Context: Mobile component architecture
- Insight: Shared component patterns improve maintainability
- Application: Created reusable patterns for lists, forms, and details views
- Impact: Faster development and consistent UX
- Related: L281, L258

L301:
- Context: Mobile offline strategy
- Insight: Combining AsyncStorage with SQLite provides robust offline support
- Application: Created hybrid storage strategy for different data types
- Impact: Better offline reliability and performance
- Related: L282, L287

L302:
- Context: Mobile performance optimization
- Insight: FlashList with proper configuration significantly improves list performance
- Application: Implemented virtualized lists with optimized configurations
- Impact: Smooth scrolling and better memory usage
- Related: L295, L254

L303:
- Context: Mobile error handling
- Insight: Mobile-specific error states need different presentation patterns
- Application: Created mobile-specific error components with proper feedback
- Impact: Better error handling and user experience
- Related: L285, L259

L304:
- Context: Mobile chart optimization
- Insight: Victory Native charts require specific optimization for mobile
- Application: Implemented responsive chart sizing and data processing
- Impact: Better chart performance on mobile devices
- Related: L295, L292

L305:
- Context: Mobile security patterns
- Insight: Mobile security requires platform-specific considerations
- Application: Implemented secure storage and biometric authentication
- Impact: Better security on mobile devices
- Related: L280, L282

L306:
- Context: Patient details component organization
- Insight: Separating patient details into specialized components improves maintainability
- Application: Created separate components for each medical data type (allergies, immunizations, etc.)
- Impact: Better code organization and easier maintenance
- Related: L300, L281

L307:
- Context: Medical data visualization
- Insight: Different medical data types require specialized visualization patterns
- Application: Implemented specific card layouts and warning systems for each data type
- Impact: Better data comprehension and clinical decision support
- Related: L289, L294

L308:
- Context: Patient details navigation
- Insight: Tabbed navigation with FAB provides efficient mobile interaction
- Application: Created context-aware floating action buttons for each section
- Impact: Improved user efficiency and data entry workflow
- Related: L298, L283

L309:
- Context: Medical data synchronization
- Insight: Different medical data types require different sync priorities
- Application: Implemented priority-based sync queue for medical data
- Impact: Better offline reliability for critical data
- Related: L301, L287

L310:
- Context: Medical data validation
- Insight: Each medical data type requires specific validation rules
- Application: Created specialized Zod schemas for each medical data type
- Impact: Better data integrity and compliance
- Related: L288, L291

L311:
- Context: Patient details state management
- Insight: Centralized state management improves data consistency
- Application: Created unified patient details service with type-safe methods
- Impact: Better data consistency and reduced code duplication
- Related: L299, L290

L312:
- Context: Medical data error handling
- Insight: Different medical data types require specific error handling
- Application: Implemented context-aware error components for each section
- Impact: More informative error messages and better error recovery
- Related: L303, L285

L313:
- Context: Patient details performance
- Insight: Medical data requires efficient list rendering and caching
- Application: Implemented virtualized lists and selective data persistence
- Impact: Better performance with large medical datasets
- Related: L302, L295

L314:
- Context: Medical data offline access
- Insight: Different medical data types have different offline requirements
- Application: Created priority-based caching strategy for medical data
- Impact: Better offline availability for critical data
- Related: L301, L293

L315:
- Context: Patient details security
- Insight: Medical data requires section-specific access control
- Application: Implemented granular permissions for different medical data types
- Impact: Better security and HIPAA compliance
- Related: L305, L280

L276: Context: Document access control component architecture
Insight: Separating access control into distinct components (dialog, panel, audit) improves maintainability
Application: Created reusable components for grant access, management panel, and audit log viewing
Impact: Reduced code duplication and improved component reusability
Related: L270, L272

L277: Context: User search implementation pattern
Insight: Combining debounced search with recent/suggested results provides better UX
Application: Implemented useEnhancedUserSearch hook with integrated functionality
Impact: Improved search performance and user experience
Related: L271, L275

L278: Context: Access control type safety
Insight: Using discriminated unions for access levels and audit actions ensures type safety
Application: Created strict types for AccessLevel and DocumentAuditAction
Impact: Caught potential type errors at compile time
Related: L274, L272

L279: Context: Document audit logging pattern
Insight: Using a centralized audit service with standardized action types improves tracking
Application: Implemented comprehensive audit logging with typed actions and metadata
Impact: Better tracking and analysis of document access patterns
Related: L272, L275

## Type Safety Patterns

### Safe Database Response Transformation

## Database Optimization Patterns

### Materialized Views
```sql
-- Create materialized view for aggregated data
CREATE MATERIALIZED VIEW mv_user_stats AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT p.id) as patient_count,
  COUNT(DISTINCT a.id) as appointment_count
FROM users u
LEFT JOIN patients p ON u.id = p.user_id
LEFT JOIN appointments a ON u.id = a.user_id
GROUP BY u.id;

-- Create secure view on top
CREATE VIEW user_stats AS
SELECT s.*
FROM mv_user_stats s
WHERE s.user_id = auth.uid();

-- Create refresh function and trigger
CREATE FUNCTION refresh_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH STATEMENT EXECUTE FUNCTION refresh_stats();
```

### Full-Text Search
```sql
-- Enable trigram extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search document view
CREATE MATERIALIZED VIEW mv_patient_search AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  to_tsvector('english',
    concat_ws(' ',
      p.first_name,
      p.last_name,
      string_agg(m.name, ' ')
    )
  ) as search_vector
FROM patients p
LEFT JOIN medications m ON p.id = m.patient_id
GROUP BY p.id;

-- Create GIN indexes
CREATE INDEX idx_search_trgm 
ON mv_patient_search USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);

CREATE INDEX idx_search_vector 
ON mv_patient_search USING GIN (search_vector);
```

### Optimized Timeline Queries
```sql
-- Create composite indexes
CREATE INDEX idx_medications_patient_date 
ON medications (patient_id, start_date DESC NULLS LAST);

CREATE INDEX idx_appointments_patient_date 
ON appointments (patient_id, date DESC NULLS LAST);

-- Create timeline view
CREATE MATERIALIZED VIEW mv_patient_timeline AS
SELECT 
  'medication' as event_type,
  m.id as event_id,
  m.patient_id,
  m.name as title,
  m.start_date as event_date
FROM medications m
UNION ALL
SELECT 
  'appointment' as event_type,
  a.id as event_id,
  a.patient_id,
  a.type as title,
  a.date as event_date
FROM appointments a;
```

### Type-Safe Queries
```typescript
interface TimelineEvent {
  event_type: 'medication' | 'appointment'
  event_id: number
  patient_id: number
  title: string
  event_date: string
}

async function fetchTimeline(
  supabase: SupabaseClient,
  patientId: number
): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from('patient_timeline')
    .select('*')
    .eq('patient_id', patientId)
    .order('event_date', { ascending: false })
    .returns<TimelineEvent[]>()

  if (error) throw error
  return data || []
}
```

### Performance Best Practices
1. Use materialized views for expensive computations
2. Add composite indexes for common query patterns
3. Implement concurrent view refreshes
4. Use array_agg for efficient grouping
5. Add type safety with TypeScript interfaces
6. Implement proper error handling
7. Use toast notifications for user feedback
8. Monitor query performance
9. Cache frequently accessed data
10. Use pagination for large datasets