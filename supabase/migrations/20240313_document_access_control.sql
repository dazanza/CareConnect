-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for access levels
DO $$ BEGIN
    CREATE TYPE document_access_level AS ENUM ('view', 'edit', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for audit actions
DO $$ BEGIN
    CREATE TYPE document_audit_action AS ENUM (
        'create',
        'update',
        'delete',
        'view',
        'download',
        'grant_access',
        'revoke_access',
        'update_access'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop existing tables if they exist
DO $$ BEGIN
    DROP TABLE IF EXISTS document_audit_logs;
    DROP TABLE IF EXISTS document_access;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

-- Create document access table
CREATE TABLE document_access (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    access_level document_access_level NOT NULL,
    granted_by uuid REFERENCES auth.users(id) NOT NULL,
    granted_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at timestamptz,
    revoked_at timestamptz
);

-- Create document audit logs table
CREATE TABLE document_audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    action document_audit_action NOT NULL,
    action_timestamp timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    metadata jsonb,
    ip_address text,
    user_agent text
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_document_access_document_id ON document_access(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_user_id ON document_access(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_granted_by ON document_access(granted_by);
CREATE INDEX IF NOT EXISTS idx_document_audit_logs_document_id ON document_audit_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_audit_logs_user_id ON document_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_document_audit_logs_action_timestamp ON document_audit_logs(action_timestamp);

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS document_access_audit ON document_access;
DROP FUNCTION IF EXISTS log_document_access();
DROP FUNCTION IF EXISTS check_document_access(uuid, uuid, document_access_level);

-- Function to check document access level
CREATE OR REPLACE FUNCTION check_document_access(doc_id uuid, user_id uuid, required_level document_access_level)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM document_access
        WHERE document_id = doc_id
        AND user_id = user_id
        AND access_level >= required_level
        AND (expires_at IS NULL OR expires_at > now())
        AND revoked_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log document access events
CREATE OR REPLACE FUNCTION log_document_access()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO document_audit_logs (
            document_id,
            user_id,
            action,
            metadata
        ) VALUES (
            NEW.document_id,
            NEW.user_id,
            'grant_access',
            jsonb_build_object(
                'granted_by', NEW.granted_by,
                'access_level', NEW.access_level,
                'expires_at', NEW.expires_at
            )
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.revoked_at IS NOT NULL AND OLD.revoked_at IS NULL THEN
            INSERT INTO document_audit_logs (
                document_id,
                user_id,
                action,
                metadata
            ) VALUES (
                NEW.document_id,
                NEW.user_id,
                'revoke_access',
                jsonb_build_object('revoked_at', NEW.revoked_at)
            );
        ELSE
            INSERT INTO document_audit_logs (
                document_id,
                user_id,
                action,
                metadata
            ) VALUES (
                NEW.document_id,
                NEW.user_id,
                'update_access',
                jsonb_build_object(
                    'old_level', OLD.access_level,
                    'new_level', NEW.access_level,
                    'expires_at', NEW.expires_at
                )
            );
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document access audit logging
CREATE TRIGGER document_access_audit
    AFTER INSERT OR UPDATE OR DELETE ON document_access
    FOR EACH ROW EXECUTE FUNCTION log_document_access();

-- Enable Row Level Security
ALTER TABLE document_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own access entries" ON document_access;
DROP POLICY IF EXISTS "Document owners can manage access" ON document_access;
DROP POLICY IF EXISTS "Users with admin access can manage access" ON document_access;
DROP POLICY IF EXISTS "Document owners can view audit logs" ON document_audit_logs;
DROP POLICY IF EXISTS "Users with admin access can view audit logs" ON document_audit_logs;

-- RLS Policies for document_access table
CREATE POLICY "Users can view their own access entries"
    ON document_access FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Document owners can manage access"
    ON document_access FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM documents d
            WHERE d.id = document_id
            AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users with admin access can manage access"
    ON document_access FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM document_access da
            WHERE da.document_id = document_id
            AND da.user_id = auth.uid()
            AND da.access_level = 'admin'
            AND (da.expires_at IS NULL OR da.expires_at > now())
            AND da.revoked_at IS NULL
        )
    );

-- RLS Policies for document_audit_logs table
CREATE POLICY "Document owners can view audit logs"
    ON document_audit_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM documents d
            WHERE d.id = document_id
            AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users with admin access can view audit logs"
    ON document_audit_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM document_access da
            WHERE da.document_id = document_id
            AND da.user_id = auth.uid()
            AND da.access_level = 'admin'
            AND (da.expires_at IS NULL OR da.expires_at > now())
            AND da.revoked_at IS NULL
        )
    );

-- Migrate existing document owners to have admin access
INSERT INTO document_access (document_id, user_id, access_level, granted_by)
SELECT 
    id as document_id,
    user_id,
    'admin'::document_access_level as access_level,
    user_id as granted_by
FROM documents
ON CONFLICT DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE document_access IS 'Stores document access control information with granular permissions';
COMMENT ON TABLE document_audit_logs IS 'Audit trail for all document-related actions'; 