import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { LoginButton } from '../components/LoginButton'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'
import { QrCode, Clock, CheckCircle, XCircle, AlertCircle, FileText, Users, Scan, Shield, ArrowRight, Settings } from 'lucide-react'
import { toast } from 'sonner'

const Home: React.FC = () => {
  const { user, loading } = useAuth()
  const [latestPass, setLatestPass] = useState<any>(null)
  const [mentor, setMentor] = useState<any>(null)
  const [, setError] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)
  const nav = useNavigate()

  // Redirect users without roles to contact admin page
  useEffect(() => {
    if (user && !user.role) {
      nav('/contact-admin', { replace: true });
      return;
    }
  }, [user, nav])

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') return

    const fetchStatus = async () => {
      try {
        const res = await api.get('/student/status')
        setLatestPass(res.data.passes[0] || null)
        if (res.data.passes[0]) {
          if (res.data.passes[0].status === 'APPROVED') {
            toast.success('Gate Pass Approved!', {
              description: 'Your latest gate pass has been approved. You can now show the QR code to security.'
            });
          } else if (res.data.passes[0].status === 'PENDING') {
            toast.info('Gate Pass Pending', {
              description: 'Your gate pass is waiting for mentor approval.'
            });
          } else if (res.data.passes[0].status === 'REJECTED') {
            toast.error('Gate Pass Rejected', {
              description: 'Your latest gate pass was rejected. You can apply for a new one.'
            });
          }
        }
      } catch {
        const errorMessage = 'Failed to fetch latest gate pass.';
        setError(errorMessage);
        toast.error('Failed to Load Status', {
          description: errorMessage
        });
      }
    }

    const fetchMentor = async () => {
      try {
        const res = await api.get('/student/mentor')
        setMentor(res.data.mentor)
      } catch (err) {
        console.log('Failed to fetch mentor details:', err)
        setMentor(null)
      }
    }

    fetchStatus()
    fetchMentor()
  }, [user])

  if (loading) {
    return (
      <div className="container-fluid px-3 py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 text-center">
            <div className="card border-0 bg-transparent">
              <div className="card-body py-5">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-muted">Loading your dashboard...</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-vh-100 d-flex align-items-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
              <div className="card border-0 shadow-lg" style={{ borderRadius: '24px' }}>
                <div className="card-body text-center p-5">
                  <div className="d-inline-flex align-items-center justify-content-center mb-4"
                       style={{ 
                         width: '100px', 
                         height: '100px',
                         borderRadius: '24px',
                         background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
                       }}>
                    <Shield size={48} className="text-primary" />
                  </div>
                  <h1 className="h2 fw-bold text-primary mb-3" style={{ letterSpacing: '-0.02em' }}>
                    Welcome to VNR OutPass
                  </h1>
                  <p className="text-muted mb-4 lead" style={{ fontSize: '1.125rem', lineHeight: '1.6' }}>
                    Secure and streamlined gate pass management system for VNR students and staff.
                  </p>
                  <div className="text-muted mb-4">
                    <small style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                      Login with your college Google account to continue
                    </small>
                  </div>
                  <div className="mb-4 d-flex justify-content-center">
  <LoginButton />
</div>
                    
                  <div className="mt-5">
                    <h6 className="fw-bold mb-4 text-center" style={{ 
                      fontSize: '1rem', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      color: '#374151'
                    }}>
                      Features
                    </h6>
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="d-flex align-items-center p-3 rounded-3" style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.1)'
                        }}>
                          <FileText size={20} className="text-primary me-2" />
                          <small className="text-muted fw-medium">Easy Applications</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center p-3 rounded-3" style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.1)'
                        }}>
                          <QrCode size={20} className="text-primary me-2" />
                          <small className="text-muted fw-medium">QR Code Access</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center p-3 rounded-3" style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.1)'
                        }}>
                          <CheckCircle size={20} className="text-primary me-2" />
                          <small className="text-muted fw-medium">Real-time Status</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center p-3 rounded-3" style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.1)'
                        }}>
                          <Shield size={20} className="text-primary me-2" />
                          <small className="text-muted fw-medium">Secure System</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle size={20} className="text-success" />
      case 'PENDING':
        return <Clock size={20} className="text-warning" />
      case 'REJECTED':
        return <XCircle size={20} className="text-danger" />
      default:
        return <AlertCircle size={20} className="text-muted" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success'
      case 'PENDING': return 'warning'
      case 'REJECTED': return 'danger'
      default: return 'secondary'
    }
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header Section */}
      <div className="container-fluid px-4 py-4">
        <div className="row">
          <div className="col-12">
            <div className="text-center mb-4">
              <h1 className="display-5 fw-bold text-dark mb-2">Welcome back, {user.name}</h1>
              <p className="text-muted fs-5">Your personalized dashboard</p>
            </div>
          </div>
        </div>

        {/* Student Dashboard */}
        {user.role === 'STUDENT' && (
          <>
            {/* Mentor Information - Top Priority */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="d-inline-flex align-items-center justify-content-center me-3"
                           style={{ 
                             width: '50px', 
                             height: '50px',
                             borderRadius: '15px',
                             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                           }}>
                        <Users size={26} className="text-white" />
                      </div>
                      <div>
                        <h4 className="mb-1 fw-bold text-dark">Your Assigned Mentor</h4>
                        <p className="mb-0 text-muted">Gate pass approval authority</p>
                      </div>
                    </div>
                    {mentor ? (
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="text-center text-md-start">
                            <h5 className="fw-bold text-primary mb-1">{mentor.name}</h5>
                            <p className="text-muted mb-1">{mentor.email}</p>
                            <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                              {mentor.role}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-8">
                          <div className="d-flex align-items-center h-100">
                            <div className="alert alert-info border-0 mb-0 w-100" style={{ backgroundColor: '#e7f3ff' }}>
                              <div className="d-flex align-items-center">
                                <span className="text-info">
                                  All your gate pass applications will be reviewed and approved by this mentor
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="d-inline-flex align-items-center justify-content-center mb-3"
                             style={{ 
                               width: '80px', 
                               height: '80px',
                               borderRadius: '20px',
                               background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
                             }}>
                          <AlertCircle size={36} className="text-danger" />
                        </div>
                        <h5 className="text-danger mb-2">No Mentor Assigned</h5>
                        <p className="text-muted mb-0">
                          Please contact your HOD or admin to get a mentor assigned for gate pass approvals.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="row g-4">
              {/* Latest Gate Pass Card */}
              <div className="col-lg-8">
                {latestPass ? (
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '20px' }}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <h4 className="mb-0 fw-bold text-dark">Latest Gate Pass</h4>
                        <span className={`badge bg-${getStatusColor(latestPass.status)} px-3 py-2 rounded-pill fs-6`}>
                          {getStatusIcon(latestPass.status)}
                          <span className="ms-2">{latestPass.status}</span>
                        </span>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-12">
                          <div className="p-4 rounded-4" style={{ 
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
                            border: '1px solid rgba(59, 130, 246, 0.15)'
                          }}>
                            <h6 className="text-muted mb-2 small fw-bold" style={{ 
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em'
                            }}>Reason for Leave</h6>
                            <p className="mb-0 text-dark fw-semibold fs-5">{latestPass.reason}</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-4 rounded-4" style={{ 
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.15)'
                          }}>
                            <h6 className="text-muted mb-2 small fw-bold" style={{ 
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em'
                            }}>Applied On</h6>
                            <p className="mb-1 text-dark fw-semibold">
                              {new Date(latestPass.appliedAt).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="mb-0 text-muted small">
                              {new Date(latestPass.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-4 rounded-4" style={{ 
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
                            border: '1px solid rgba(245, 158, 11, 0.15)'
                          }}>
                            <h6 className="text-muted mb-2 small fw-bold" style={{ 
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em'
                            }}>Current Status</h6>
                            <div className="d-flex align-items-center">
                              {getStatusIcon(latestPass.status)}
                              <span className="ms-2 text-dark fw-bold fs-5">{latestPass.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Section */}
                      {latestPass.status === 'APPROVED' && (
                        <div className="border-top pt-4 mt-4">
                          {!latestPass.qr ? (
                            <div className="text-center py-4">
                              <div className="d-inline-flex align-items-center justify-content-center mb-3"
                                   style={{ 
                                     width: '60px', 
                                     height: '60px',
                                     borderRadius: '15px',
                                     background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
                                   }}>
                                <AlertCircle size={30} className="text-warning" />
                              </div>
                              <h6 className="text-warning mb-1">QR Code Generating</h6>
                              <p className="text-muted mb-0">Your QR code is being generated...</p>
                            </div>
                          ) : !showQr ? (
                            <div className="text-center py-4">
                              <button
                                className="btn btn-success btn-lg px-5 py-3 d-inline-flex align-items-center rounded-pill shadow-sm"
                                onClick={() => setShowQr(true)}
                                style={{ fontSize: '1.1rem' }}
                              >
                                <QrCode size={24} className="me-2" />
                                Show QR Code
                              </button>
                              <p className="text-muted mt-3 mb-0">Present this QR code to security when exiting</p>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="d-inline-block p-4 bg-white rounded-4 shadow-sm mb-4">
                                <img
                                  src={latestPass.qr}
                                  alt="Gate Pass QR"
                                  className="img-fluid"
                                  style={{ maxWidth: '220px', width: '100%' }}
                                />
                              </div>
                              <div>
                                <button
                                  className="btn btn-outline-secondary rounded-pill px-4"
                                  onClick={() => setShowQr(false)}
                                >
                                  Hide QR Code
                                </button>
                                <p className="text-success mt-3 mb-0 fw-medium">
                                  📱 Present this QR code to security when exiting campus
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status Messages */}
                      {latestPass.status === 'PENDING' && (
                        <div className="alert border-0 mt-4 p-4 rounded-4" style={{ backgroundColor: '#fff3cd' }}>
                          <div className="d-flex align-items-center">
                            <div className="d-inline-flex align-items-center justify-content-center me-3"
                                 style={{ 
                                   width: '40px', 
                                   height: '40px',
                                   borderRadius: '10px',
                                   background: 'rgba(245, 158, 11, 0.2)'
                                 }}>
                              <Clock size={20} className="text-warning" />
                            </div>
                            <div>
                              <h6 className="text-warning mb-1 fw-bold">Awaiting Approval</h6>
                              <span className="text-warning">Your application is being reviewed by your mentor.</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {latestPass.status === 'REJECTED' && (
                        <div className="alert border-0 mt-4 p-4 rounded-4" style={{ backgroundColor: '#f8d7da' }}>
                          <div className="d-flex align-items-center">
                            <div className="d-inline-flex align-items-center justify-content-center me-3"
                                 style={{ 
                                   width: '40px', 
                                   height: '40px',
                                   borderRadius: '10px',
                                   background: 'rgba(220, 53, 69, 0.2)'
                                 }}>
                              <XCircle size={20} className="text-danger" />
                            </div>
                            <div>
                              <h6 className="text-danger mb-1 fw-bold">Application Rejected</h6>
                              <span className="text-danger">Your application was rejected. You can apply for a new gate pass.</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '20px' }}>
                    <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-5">
                      <div className="d-inline-flex align-items-center justify-content-center mb-4"
                           style={{ 
                             width: '100px', 
                             height: '100px',
                             borderRadius: '25px',
                             background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
                           }}>
                        <FileText size={48} className="text-primary" />
                      </div>
                      <h4 className="fw-bold text-dark mb-3">No Gate Pass Applications</h4>
                      <p className="text-muted mb-4 fs-5">You haven't applied for any gate passes yet.</p>
                      <button
                        className="btn btn-primary btn-lg px-5 py-3 d-inline-flex align-items-center rounded-pill shadow-sm"
                        onClick={() => nav('/apply')}
                        style={{ fontSize: '1.1rem' }}
                      >
                        <FileText size={24} className="me-2" />
                        Apply for Gate Pass
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions Sidebar */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                  <div className="card-body p-4">
                    <h4 className="fw-bold text-dark mb-4">Quick Actions</h4>
                    <div className="d-grid gap-3">
                      <button
                        className="btn btn-primary text-start d-flex align-items-center justify-content-between py-4 px-4 rounded-4 shadow-sm"
                        onClick={() => nav('/apply')}
                      >
                        <div className="d-flex align-items-center">
                          <div className="d-inline-flex align-items-center justify-content-center me-3"
                               style={{ 
                                 width: '50px', 
                                 height: '50px',
                                 borderRadius: '12px',
                                 background: 'rgba(255, 255, 255, 0.2)'
                               }}>
                            <FileText size={24} className="text-white" />
                          </div>
                          <div>
                            <div className="fw-bold fs-5 text-white">Apply for Pass</div>
                            <small className="text-white opacity-75">Submit new application</small>
                          </div>
                        </div>
                        <ArrowRight size={20} className="text-white" />
                      </button>
                      <button
                        className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between py-4 px-4 rounded-4"
                        onClick={() => nav('/student/status')}
                      >
                        <div className="d-flex align-items-center">
                          <div className="d-inline-flex align-items-center justify-content-center me-3"
                               style={{ 
                                 width: '50px', 
                                 height: '50px',
                                 borderRadius: '12px',
                                 background: 'rgba(59, 130, 246, 0.1)'
                               }}>
                            <Shield size={24} className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-bold fs-5 text-primary">My Passes</div>
                            <small className="text-muted">View all applications</small>
                          </div>
                        </div>
                        <ArrowRight size={20} className="text-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mentor Dashboard */}
        {user.role === 'MENTOR' && (
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card border-0 shadow-sm text-center" style={{ borderRadius: '20px' }}>
                <div className="card-body p-5">
                  <div className="d-inline-flex align-items-center justify-content-center mb-4"
                       style={{ 
                         width: '100px', 
                         height: '100px',
                         borderRadius: '25px',
                         background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
                       }}>
                    <Users size={48} className="text-primary" />
                  </div>
                  <h3 className="fw-bold text-dark mb-3">Mentor Dashboard</h3>
                  <p className="text-muted mb-4 fs-5">
                    Review and approve student gate pass requests efficiently.
                  </p>
                  <button
                    className="btn btn-primary btn-lg px-5 py-3 d-inline-flex align-items-center rounded-pill shadow-sm"
                    onClick={() => nav('/mentor')}
                    style={{ fontSize: '1.1rem' }}
                  >
                    <Users size={24} className="me-2" />
                    View Pending Requests
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Dashboard */}
        {user.role === 'SECURITY' && (
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card border-0 shadow-sm text-center" style={{ borderRadius: '20px' }}>
                <div className="card-body p-5">
                  <div className="d-inline-flex align-items-center justify-content-center mb-4"
                       style={{ 
                         width: '100px', 
                         height: '100px',
                         borderRadius: '25px',
                         background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                       }}>
                    <Scan size={48} className="text-success" />
                  </div>
                  <h3 className="fw-bold text-dark mb-3">Security Dashboard</h3>
                  <p className="text-muted mb-4 fs-5">
                    Scan student QR codes to verify gate pass authenticity.
                  </p>
                  <button
                    className="btn btn-success btn-lg px-5 py-3 d-inline-flex align-items-center rounded-pill shadow-sm"
                    onClick={() => nav('/security')}
                    style={{ fontSize: '1.1rem' }}
                  >
                    <Scan size={24} className="me-2" />
                    Start Scanning
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOD Dashboard */}
        {user.role === 'HOD' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm text-center h-100" style={{ borderRadius: '20px' }}>
                <div className="card-body p-4">
                  <div className="d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ 
                         width: '80px', 
                         height: '80px',
                         borderRadius: '20px',
                         background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)'
                       }}>
                    <Shield size={36} className="text-purple-600" />
                  </div>
                  <h4 className="fw-bold text-dark mb-3">HOD Panel</h4>
                  <p className="text-muted mb-4">
                    Review escalated requests and manage department policies.
                  </p>
                  <button
                    className="btn btn-outline-purple btn-lg px-4 py-2 d-inline-flex align-items-center rounded-pill"
                    onClick={() => nav('/hod')}
                    style={{
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.color = '';
                    }}
                  >
                    <Shield size={20} className="me-2" />
                    Open HOD Panel
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm text-center h-100" style={{ borderRadius: '20px' }}>
                <div className="card-body p-4">
                  <div className="d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ 
                         width: '80px', 
                         height: '80px',
                         borderRadius: '20px',
                         background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
                       }}>
                    <Settings size={36} className="text-danger" />
                  </div>
                  <h4 className="fw-bold text-dark mb-3">Admin Panel</h4>
                  <p className="text-muted mb-4">
                    Manage users, reports, and system configuration.
                  </p>
                  <button
                    className="btn btn-outline-danger btn-lg px-4 py-2 d-inline-flex align-items-center rounded-pill"
                    onClick={() => nav('/admin')}
                  >
                    <Settings size={20} className="me-2" />
                    Open Admin Panel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
