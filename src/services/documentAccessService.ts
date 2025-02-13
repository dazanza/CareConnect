import { supabase } from '../lib/supabase';

// Types
export type AccessLevel = 'view' | 'edit' | 'admin';

export interface DocumentAccess {
  id: string;
  documentId: string;
  userId: string;
  accessLevel: AccessLevel;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
}

export interface DocumentAuditLog {
  id: string;
  documentId: string;
  userId: string;
  action: string;
  actionTimestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class DocumentAccessService {
  /**
   * Grant access to a document for a specific user
   * @param documentId - The ID of the document
   * @param userId - The ID of the user to grant access to
   * @param level - The access level to grant
   * @param expiresAt - Optional expiration date for the access
   */
  static async grantAccess(
    documentId: string,
    userId: string,
    level: AccessLevel,
    expiresAt?: Date
  ): Promise<DocumentAccess> {
    const { data, error } = await supabase
      .from('document_access')
      .insert({
        document_id: documentId,
        user_id: userId,
        access_level: level,
        granted_by: (await supabase.auth.getUser()).data.user?.id,
        expires_at: expiresAt?.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDocumentAccess(data);
  }

  /**
   * Revoke access to a document for a specific user
   * @param documentId - The ID of the document
   * @param userId - The ID of the user to revoke access from
   */
  static async revokeAccess(documentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('document_access')
      .update({ revoked_at: new Date().toISOString() })
      .match({ document_id: documentId, user_id: userId });

    if (error) throw error;
  }

  /**
   * List all access entries for a document
   * @param documentId - The ID of the document
   */
  static async listAccess(documentId: string): Promise<DocumentAccess[]> {
    const { data, error } = await supabase
      .from('document_access')
      .select('*')
      .eq('document_id', documentId)
      .is('revoked_at', null);

    if (error) throw error;
    return data.map(this.mapDocumentAccess);
  }

  /**
   * Check if a user has specific access level to a document
   * @param documentId - The ID of the document
   * @param userId - The ID of the user to check
   * @param requiredLevel - The required access level
   */
  static async checkAccess(
    documentId: string,
    userId: string,
    requiredLevel: AccessLevel
  ): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('check_document_access', {
        doc_id: documentId,
        user_id: userId,
        required_level: requiredLevel
      });

    if (error) throw error;
    return data;
  }

  /**
   * Update access level for a user
   * @param documentId - The ID of the document
   * @param userId - The ID of the user
   * @param level - The new access level
   */
  static async updateAccess(
    documentId: string,
    userId: string,
    level: AccessLevel
  ): Promise<DocumentAccess> {
    const { data, error } = await supabase
      .from('document_access')
      .update({ access_level: level })
      .match({ document_id: documentId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return this.mapDocumentAccess(data);
  }

  /**
   * Get audit logs for a document
   * @param documentId - The ID of the document
   * @param limit - Maximum number of logs to return
   * @param offset - Number of logs to skip
   */
  static async getAccessAudit(
    documentId: string,
    limit = 50,
    offset = 0
  ): Promise<DocumentAuditLog[]> {
    const { data, error } = await supabase
      .from('document_audit_logs')
      .select('*')
      .eq('document_id', documentId)
      .order('action_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data.map(this.mapAuditLog);
  }

  /**
   * Map database record to DocumentAccess type
   */
  private static mapDocumentAccess(record: any): DocumentAccess {
    return {
      id: record.id,
      documentId: record.document_id,
      userId: record.user_id,
      accessLevel: record.access_level,
      grantedBy: record.granted_by,
      grantedAt: new Date(record.granted_at),
      expiresAt: record.expires_at ? new Date(record.expires_at) : undefined,
      revokedAt: record.revoked_at ? new Date(record.revoked_at) : undefined
    };
  }

  /**
   * Map database record to DocumentAuditLog type
   */
  private static mapAuditLog(record: any): DocumentAuditLog {
    return {
      id: record.id,
      documentId: record.document_id,
      userId: record.user_id,
      action: record.action,
      actionTimestamp: new Date(record.action_timestamp),
      metadata: record.metadata,
      ipAddress: record.ip_address,
      userAgent: record.user_agent
    };
  }
} 