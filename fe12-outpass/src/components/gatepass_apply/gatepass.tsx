import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { AlertTriangle, FileText, Send } from 'lucide-react'
import { toast } from 'sonner'
import './gatepass.css'

interface GatePassData {
  reason: string
}

const GatePassForm: React.FC = () => {
  const [data, setData] = useState<GatePassData>({ reason: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.reason.trim()) {
      const errorMessage = 'Please provide a reason for your gate pass request.';
      setError(errorMessage);
      toast.error('Validation Error', {
        description: errorMessage
      });
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      toast.loading('Submitting your gate pass application...');
      await api.post('/student/apply', data)
      toast.dismiss();
      toast.success('Application Submitted!', {
        description: 'Your gate pass request has been submitted successfully and is now pending approval.'
      });
      nav('/student/status')
    } catch (e: any) {
      toast.dismiss();
      const errorMessage = e.response?.data?.error || 'Failed to submit application. Please try again.';
      setError(errorMessage);
      toast.error('Application Failed', {
        description: errorMessage
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid px-3 py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          {/* Header Card */}
          <div className="card mb-4 fade-in">
            <div className="card-body text-center py-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: '60px', height: '60px' }}>
                <FileText size={28} className="text-primary" />
              </div>
              <h2 className="card-title mb-2 fw-bold">Apply for Gate Pass</h2>
              <p className="text-muted mb-0">Submit your request with a valid reason</p>
            </div>
          </div>

          {/* Usage Warning */}
          <div className="alert alert-warning border-0 mb-4 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="d-flex align-items-start">
              <AlertTriangle size={20} className="text-warning me-2 mt-1 flex-shrink-0" />
              <div>
                <h6 className="alert-heading mb-1 fw-semibold">Usage Limit Notice</h6>
                <p className="mb-0 small">
                  You have only <strong>3 gate pass applications</strong> allowed per month. 
                  Please ensure your reason is valid and necessary.
                </p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="card shadow-sm fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="reason" className="form-label fw-semibold text-dark mb-2">
                    Reason for Gate Pass <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={data.reason}
                    onChange={handleChange}
                    rows={4}
                    required
                    className="form-control"
                    placeholder="Please provide a detailed reason for your gate pass request (e.g., Medical appointment, Family emergency, etc.)"
                    style={{ resize: 'vertical', minHeight: '120px' }}
                  />
                  <div className="form-text">
                    Provide a clear and specific reason for your request. This helps in faster approval.
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger border-0 mb-4 fade-in">
                    <div className="d-flex align-items-center">
                      <AlertTriangle size={18} className="text-danger me-2 flex-shrink-0" />
                      <span className="mb-0">{error}</span>
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary py-3 fw-semibold d-flex align-items-center justify-content-center"
                    disabled={loading || !data.reason.trim()}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="me-2" />
                        Submit Application
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary py-2"
                    onClick={() => nav('/')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info Card */}
          <div className="card border-0 bg-light mt-4 fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="card-body p-3">
              <h6 className="text-muted mb-2 fw-semibold">📋 Application Process</h6>
              <div className="small text-muted">
                <div className="mb-1">1. Submit your application with a valid reason</div>
                <div className="mb-1">2. Wait for mentor approval</div>
                <div className="mb-1">3. Approved passes will generate a QR code</div>
                <div>4. Present the QR code to security when exiting</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GatePassForm
