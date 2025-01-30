import { ShareAnalytics } from '@/components/shares/ShareAnalytics'
import { ShareAuditLog } from '@/components/shares/ShareAuditLog'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function SharesPage() {
  return (
    <div className="space-y-8">
      {/* Analytics Dashboard */}
      <ErrorBoundary>
        <ShareAnalytics />
      </ErrorBoundary>
      
      {/* Global Audit Log */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Share History</h2>
        <ErrorBoundary>
          <ShareAuditLog />
        </ErrorBoundary>
      </div>
    </div>
  )
} 
