import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { toast } from 'sonner'
import Pagination from '../components/ui/Pagination'

type Req = {
  id: string
  studentId: string
  reason: string
  status: string
  student: {
    name: string
    email: string
  }
}

const MentorRequests: React.FC = () => {
  const [reqs, setReqs] = useState<Req[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const fetchReqs = async () => {
    try {
      const res = await api.get('/mentor/requests')
      setReqs(res.data.requests)
      if (res.data.requests.length === 0) {
        toast.info('No pending requests', {
          description: 'All gate pass requests have been processed.'
        });
      }
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || 'Failed to load requests';
      setError(errorMessage);
      toast.error('Failed to Load Requests', {
        description: errorMessage
      });
    }
  }

  useEffect(() => {
    fetchReqs()
  }, [])

  const respond = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setError(null)
      toast.loading(`${action === 'APPROVE' ? 'Approving' : 'Rejecting'} gate pass request...`);
      
      const res = await api.post('/mentor/respond', { gatePassId: id, action })

      toast.dismiss();
      
      if (action === 'APPROVE') {
        toast.success('Gate Pass Approved!', {
          description: res.data.qr ? 'QR code has been generated and sent to the student.' : 'Request approved successfully.'
        });
      } else {
        toast.success('Gate Pass Rejected', {
          description: 'The student has been notified of the rejection.'
        });
      }

      setReqs(prev => prev.filter(r => r.id !== id))
    } catch (e: any) {
      toast.dismiss();
      const errorMessage = e.response?.data?.error || 'Failed to respond';
      setError(errorMessage);
      toast.error(`Failed to ${action === 'APPROVE' ? 'Approve' : 'Reject'}`, {
        description: errorMessage
      });
    }
  }

  // Pagination calculations
  const totalPages = Math.ceil(reqs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReqs = reqs.slice(startIndex, endIndex)

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Pending Gate Pass Requests</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {reqs.length === 0 && <div className="text-center text-muted">No pending requests.</div>}

      <div className="row g-4">
        {currentReqs.map(r => (
          <div className="col-md-6" key={r.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{r.student.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{r.student.email}</h6>
                <p className="card-text"><strong>Reason:</strong> {r.reason}</p>
                <p className="card-text"><strong>Status:</strong> {r.status}</p>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-success"
                    onClick={() => respond(r.id, 'APPROVE')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => respond(r.id, 'REJECT')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
          <small className="text-muted mb-2 mb-md-0">
            Showing {startIndex + 1}-{Math.min(endIndex, reqs.length)} of {reqs.length} requests
          </small>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-2 mt-md-0"
          />
        </div>
      )}
    </div>
  )
}

export default MentorRequests
