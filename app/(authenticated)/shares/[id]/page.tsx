import { ShareAuditLog } from '@/components/shares/ShareAuditLog'
import { ErrorBoundary } from '@/components/ui/error-boundary'

interface SharePageProps {
  params: {
    id: string
  }
}

export default function SharePage({ params }: SharePageProps) {
  return (
    <div className="space-y-8">
      {/* Existing share details content */}
      
      {/* Share Audit Log */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Share History</h2>
        <ErrorBoundary>
          <ShareAuditLog shareId={params.id} />
        </ErrorBoundary>
      </div>
    </div>
  )
} 
