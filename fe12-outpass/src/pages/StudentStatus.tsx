import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { toast } from 'sonner';
import { Users, Shield, AlertCircle } from 'lucide-react';
import Pagination from '../components/ui/Pagination';

type Pass = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'UTILIZED';
  qr: string | null;
  appliedAt: string;
  reason: string;
};

type Mentor = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const StudentStatus: React.FC = () => {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQrFor, setShowQrFor] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const res = await api.get<{ passes: Pass[] }>('/student/status');
        setPasses(res.data.passes);
        if (res.data.passes.length === 0) {
          toast.info('No Gate Passes Found', {
            description: 'You haven\'t applied for any gate passes yet.'
          });
        }
      } catch (e) {
        const errorMessage = (e as any).response?.data?.error || 'Failed to load passes';
        setError(errorMessage);
        toast.error('Failed to Load Passes', {
          description: errorMessage
        });
      }
    };

    const fetchMentor = async () => {
      try {
        const res = await api.get<{ mentor: Mentor }>('/student/mentor');
        setMentor(res.data.mentor);
      } catch (err) {
        console.error('Failed to fetch mentor info:', err);
        // Don't show toast for mentor fetch failure, it's not critical
      }
    };

    fetchPasses();
    fetchMentor();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(passes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPasses = passes.slice(startIndex, endIndex);

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12">
          <h2 className="text-center mb-4">Your Gate Pass Status</h2>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center">
                <Shield className="me-2 text-primary" size={24} />
                Your Mentor Details
              </h5>
              {mentor ? (
                <div className="d-flex align-items-center text-success">
                  <Users size={20} className="me-2" />
                  <div>
                    <strong>{mentor.name}</strong> ({mentor.email}) - {mentor.role}
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center text-muted">
                  <AlertCircle size={20} className="me-2" />
                  <span>No mentor assigned. Contact your HOD or admin.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {currentPasses.map((p) => (
          <div key={p.id} className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Pass ID: {p.id}</h5>
                
                <p className="card-text">
                  <strong>Reason:</strong> {p.reason}
                </p>

                <p className="card-text">
                  <strong>Applied At:</strong>{' '}
                  {new Date(p.appliedAt).toLocaleString()}
                </p>
                <p className="card-text">
                  <strong>Status:</strong> {p.status}
                </p>

                {/* Approved QR Handling */}
                {p.status === 'APPROVED' && (
                  <div className="text-center mt-3">
                    {!p.qr ? (
                      <p className="text-muted">QR Code not generated yet.</p>
                    ) : (
                      <>
                        {showQrFor === p.id ? (
                          <div>
                            <img 
                              src={p.qr} 
                              alt="QR Code" 
                              className="img-fluid mb-2" 
                              style={{maxWidth: '200px'}} 
                            />
                            <br />
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => setShowQrFor(null)}
                            >
                              Hide QR
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-success" 
                            onClick={() => setShowQrFor(p.id)}
                          >
                            Show QR Code
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
                {(p.status === 'ESCALATED' || p.status === 'UTILIZED') && (
                  <p className="text-muted">
                    This gate pass is no longer active.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
          <small className="text-muted mb-2 mb-md-0">
            Showing {startIndex + 1}-{Math.min(endIndex, passes.length)} of {passes.length} gate passes
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
  );
};

export default StudentStatus;
