/**
 * Base interface for shared fields between pending and active shares
 */
interface BaseShare {
  /** Unique identifier (UUID) */
  id: string
  
  /** Access level granted */
  access_level: 'read' | 'write' | 'admin'
  
  /** ID of user who created the share */
  shared_by_user_id: string
  
  /** Optional expiration date */
  expires_at?: string
}

/**
 * Represents a pending share invitation for a patient's medical records
 * Created when inviting someone by email, exists until claimed
 */
export interface PendingShare extends BaseShare {
  /** ID of the patient whose records are being shared (optional for pending shares) */
  patient_id?: number
  
  /** Email address the share was sent to */
  email: string
  
  /** Timestamp when the share was created */
  created_at?: string
  
  /** Timestamp when the share was claimed, if applicable */
  claimed_at?: string
  
  /** ID of the user who claimed the share, if claimed */
  claimed_by_user_id?: string
}

/**
 * Represents an active share of a patient's medical records
 * Created when a pending share is claimed or when directly sharing with an existing user
 */
export interface PatientShare extends BaseShare {
  /** ID of the patient whose records are being shared */
  patient_id: number
  
  /** ID of the user receiving access */
  shared_with_user_id: string
  
  /** Timestamp when the share was created (in UTC) */
  created_at: string
  
  /** Information about the user receiving access, if joined */
  shared_with?: {
    /** Email address of the user */
    email: string
    /** First name if provided */
    first_name?: string
    /** Last name if provided */
    last_name?: string
  }
}

/**
 * Share operation result type
 * Used to handle responses from share management functions
 */
export type ShareOperationResult<T = void> = {
  /** Whether the operation succeeded */
  success: boolean
  
  /** The operation result if applicable */
  data?: T
  
  /** Error message if operation failed */
  error?: string
  
  /** Additional error details if available */
  details?: Record<string, any>
}

/**
 * Batch share operation parameters
 */
export interface BatchShareOperation {
  /** IDs of shares to operate on */
  share_ids: string[]
  
  /** Operation to perform */
  operation: 'extend' | 'revoke' | 'modify_access'
  
  /** New values to set */
  updates?: Partial<PatientShare>
}

/**
 * Share audit log entry
 * Records changes made to shares for auditing purposes
 */
export interface ShareAuditLog {
  /** Unique identifier for the audit log entry */
  id: string
  
  /** ID of the share this log entry relates to */
  share_id: string
  
  /** Type of change that occurred */
  action: 'created' | 'modified' | 'expired' | 'revoked'
  
  /** Previous state of relevant fields */
  previous_state: Partial<PatientShare>
  
  /** New state of relevant fields */
  new_state: Partial<PatientShare>
  
  /** ID of user who made the change */
  changed_by_user_id: string
  
  /** Timestamp when the change occurred (in UTC) */
  created_at: string
}

/**
 * Analytics data for shares
 */
export interface ShareAnalytics {
  /** Unique identifier for this analytics snapshot */
  id: string

  /** Total number of active shares */
  total_active_shares: number
  
  /** Number of pending share invitations */
  pending_invitations: number
  
  /** Shares by access level */
  shares_by_access_level: {
    read: number
    write: number
    admin: number
  }
  
  /** Number of shares expiring within next 30 days */
  expiring_soon: number
  
  /** Average time to claim share invitations (in hours) */
  avg_time_to_claim: number

  /** When these analytics were calculated */
  calculated_at: string
} 