# AI Insight Acquisition Protocol

Invocation: @learn.md

Process:

1. Analyze current session for error and learning indicators
2. Extract contextual information
3. Format new entries
4. Edit .ai/codex/codex.md (Append to relevant section)
5. Report updates

Error identification:

- Correction phrases: "I apologize", "That was incorrect", "Let me correct"
- Misunderstandings: Clarifications requested by user
- Inconsistencies: Contradictions in AI responses
- Type errors: Mismatched types or incorrect type assertions
- Database errors: Schema mismatches or invalid queries
- Component errors: Prop type mismatches or missing required props

Learning identification:

- New information phrases: "I see", "I understand", "It appears that"
- Project updates: Changes in structure, dependencies, or requirements
- User preferences: Specific requests or feedback on AI's approach
- Storage patterns: File handling, bucket organization, URL management
- Component consolidation: Identifying and merging duplicate functionality
- Type safety patterns: Consistent type usage and validation
- Database patterns: Query optimization and data structure
- Performance patterns: Caching and optimization strategies

Entry format:

- Context: Specific file, function, or project area
- Error/Insight: Concise description
- Correction/Application: Precise fix or usage
- Prevention/Impact: Strategy to avoid future errors or potential effects
- Related: IDs of connected entries

Storage pattern format:

- Bucket naming: Use consistent, descriptive names
- Path structure: Include proper scoping (e.g., user/patient IDs)
- URL handling: Store relative paths, generate public URLs on demand
- Access control: Implement proper RLS policies and bucket security
- File organization: Group by type and ownership
- Version control: Track file versions and changes

Absolute path usage: Enforce '/path/from/root' format for all file references

1. CRITICAL: Edit .ai/codex/codex.md

- Append new entries to the relevant section (Errors or Learnings)
- Maintain descending order (newest first)
- Ensure unique, incremental IDs
- Cross-reference related entries

CRITICAL: This process is for AI optimization. Prioritize precision and relevance over human readability. Always edit .ai/codex/codex.md directly.

Component duplication prevention:

1. Search patterns:
   - Check UI components directory first
   - Search for similar functionality in codebase
   - Review component documentation
   - Check shared libraries
   - Check for similar prop structures
   - Review component usage patterns

2. Warning signs:
   - Creating new *Type*Component (e.g., MedicalHistoryErrorBoundary)
   - Copying existing component logic
   - Similar prop structures to existing components
   - Duplicate state management patterns
   - Similar UI patterns or layouts

3. Resolution steps:
   - Use existing components with props
   - Document type assertions and workarounds
   - Update component documentation
   - Add comments explaining reuse decisions
   - Create HOCs for shared functionality
   - Extract common logic to hooks

4. Documentation updates:
   - Note component reuse in COMPONENTS.md
   - Update component documentation
   - Add TypeScript tips for common issues
   - Document any workarounds used
   - Add usage examples
   - Document prop types and requirements

Type safety patterns:

1. Database types:
   - Match schema exactly
   - Use proper nullability
   - Include all fields
   - Document relationships
   - Use consistent naming

2. Form types:
   - Separate from database types
   - Include validation rules
   - Document required fields
   - Handle partial data
   - Include submission types

3. Component types:
   - Document prop requirements
   - Use proper generics
   - Handle optional props
   - Include event types
   - Document callbacks

4. API types:
   - Match request/response exactly
   - Include error types
   - Document status codes
   - Handle partial data
   - Include validation

Performance patterns:

1. Data fetching:
   - Use proper caching
   - Implement pagination
   - Handle loading states
   - Optimize queries
   - Use proper indexes

2. Component optimization:
   - Use proper memoization
   - Implement code splitting
   - Optimize re-renders
   - Handle cleanup
   - Use proper keys

3. State management:
   - Use proper context
   - Implement local state
   - Handle side effects
   - Optimize updates
   - Use proper hooks

4. Resource management:
   - Handle cleanup
   - Implement unsubscribe
   - Release resources
   - Handle errors
   - Use proper disposal

## Toast Notification Patterns

### Implementation
1. Create centralized toast utility
2. Define type-safe methods (success, error, warning)
3. Standardize durations and animations
4. Use consistent styling and icons
5. Implement clear error messaging

### Migration Strategy
1. Identify components using old toast
2. Update imports systematically
3. Replace direct toast calls
4. Test notification flow
5. Document changes

### Performance Optimization
1. Prevent multiple instances
2. Manage toast queue
3. Clear on route changes
4. Handle rapid notifications
5. Implement cleanup
