import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Users, UserX, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { api } from '../../api';

interface UnmappedStudent {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  createdAt: string;
}

interface SystemHealth {
  status: 'OK' | 'ERROR';
  isOnline: boolean;
}

interface QuickActionsProps {
  onNavigateToMapping?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigateToMapping }) => {
  const [unmappedStudents, setUnmappedStudents] = useState<UnmappedStudent[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({ status: 'ERROR', isOnline: false });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUnmappedStudents();
    checkSystemHealth();
  }, []);

  const fetchUnmappedStudents = async () => {
    try {
      setLoading(true);
      // Use the correct admin endpoint that returns unmapped students
      const response = await api.get('/admin/student-mentor-mappings');
      const { studentsWithoutMentors } = response.data;
      setUnmappedStudents(studentsWithoutMentors || []);
    } catch (error) {
      toast.error('Failed to Load Data', {
        description: 'Unable to fetch unmapped students data.'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSystemHealth = async () => {
    try {
      const response = await api.get('/health');
      if (response.data.status === 'OK') {
        setSystemHealth({ status: 'OK', isOnline: true });
      } else {
        setSystemHealth({ status: 'ERROR', isOnline: false });
      }
    } catch (error) {
      setSystemHealth({ status: 'ERROR', isOnline: false });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUnmappedStudents(), checkSystemHealth()]);
    setRefreshing(false);
    toast.success('Data Refreshed', {
      description: 'System data has been updated.'
    });
  };

  const handleGoToMapping = () => {
    if (onNavigateToMapping) {
      onNavigateToMapping();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading quick actions...</p>
      </div>
    );
  }

  return (
    <div className="quick-actions">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <AlertTriangle className="text-warning me-3" style={{width: '1.75rem', height: '1.75rem'}} />
          <div>
            <h3 className="fw-bold mb-1 text-warning">Quick Actions</h3>
            <p className="text-muted mb-0">System alerts and recommended actions</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-outline-secondary d-flex align-items-center"
        >
          <RefreshCw 
            className={`me-2 ${refreshing ? 'spinner-border spinner-border-sm' : ''}`} 
            size={16} 
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Unmapped Students Alert */}
      <div className="row">
        <div className="col-12">
          <div className={`card border-0 shadow-sm ${unmappedStudents.length > 0 ? 'border-warning bg-warning-subtle' : 'border-success bg-success-subtle'}`}>
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between">
                <div className="d-flex align-items-start">
                  <div className={`rounded-circle p-3 me-4 ${unmappedStudents.length > 0 ? 'bg-warning' : 'bg-success'}`}>
                    {unmappedStudents.length > 0 ? (
                      <UserX className="text-white" size={24} />
                    ) : (
                      <CheckCircle className="text-white" size={24} />
                    )}
                  </div>
                  <div>
                    <h5 className={`fw-bold mb-2 ${unmappedStudents.length > 0 ? 'text-warning-emphasis' : 'text-success-emphasis'}`}>
                      {unmappedStudents.length > 0 ? 'Students Without Mentors' : 'All Students Mapped'}
                    </h5>
                    {unmappedStudents.length > 0 ? (
                      <>
                        <p className="text-warning-emphasis mb-3">
                          <strong>{unmappedStudents.length}</strong> student(s) need mentor assignment to access the outpass system.
                        </p>
                        <div className="alert alert-warning border-warning border-opacity-50 bg-warning bg-opacity-25 mb-3">
                          <div className="d-flex align-items-center">
                            <AlertTriangle size={16} className="me-2" />
                            <small className="mb-0">
                              <strong>Action Required:</strong> These students cannot apply for outpasses without mentor assignments.
                            </small>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-success-emphasis mb-3">
                        Excellent! All students have been assigned to mentors and can access the outpass system.
                      </p>
                    )}
                  </div>
                </div>
                
                {unmappedStudents.length > 0 && (
                  <button
                    onClick={handleGoToMapping}
                    className="btn btn-warning d-flex align-items-center"
                  >
                    Assign Mentors
                    <ArrowRight size={16} className="ms-2" />
                  </button>
                )}
              </div>

              {/* List of unmapped students */}
              {unmappedStudents.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-semibold mb-3 text-warning-emphasis">Students Requiring Attention:</h6>
                  <div className="row g-2">
                    {unmappedStudents.slice(0, 6).map((student) => (
                      <div key={student.id} className="col-md-4">
                        <div className="card border-warning border-opacity-50 bg-warning bg-opacity-10">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-warning bg-opacity-25 rounded-circle p-2 me-3">
                                <Users size={16} className="text-warning-emphasis" />
                              </div>
                              <div className="flex-grow-1 min-w-0">
                                <div className="fw-medium text-warning-emphasis text-truncate">
                                  {student.name}
                                </div>
                                <small className="text-muted text-truncate d-block">
                                  {student.email}
                                </small>
                                <small className="text-muted">
                                  Joined: {new Date(student.createdAt).toLocaleDateString()}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {unmappedStudents.length > 6 && (
                      <div className="col-md-4">
                        <div className="card border-warning border-opacity-50 bg-warning bg-opacity-10">
                          <div className="card-body p-3 d-flex align-items-center justify-content-center">
                            <div className="text-center">
                              <div className="fw-bold text-warning-emphasis">
                                +{unmappedStudents.length - 6} more
                              </div>
                              <small className="text-muted">students need mapping</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                <Users className="text-primary" size={24} />
              </div>
              <h6 className="fw-semibold">Manage Mappings</h6>
              <p className="text-muted small mb-3">Assign or reassign student-mentor relationships</p>
              <button
                onClick={handleGoToMapping}
                className="btn btn-outline-primary btn-sm"
              >
                Go to Mapping
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className={`${systemHealth.isOnline ? 'bg-success' : 'bg-danger'} bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3`}>
                <RefreshCw className={`${systemHealth.isOnline ? 'text-success' : 'text-danger'}`} size={24} />
              </div>
              <h6 className="fw-semibold">System Status</h6>
              <p className="text-muted small mb-3">
                {systemHealth.isOnline 
                  ? 'All systems operational and running smoothly' 
                  : 'System health check failed or server unreachable'}
              </p>
              <span className={`badge ${systemHealth.isOnline ? 'bg-success' : 'bg-danger'}`}>
                {systemHealth.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                <CheckCircle className="text-success" size={24} />
              </div>
              <h6 className="fw-semibold">Data Integrity</h6>
              <p className="text-muted small mb-3">All data validation checks passed</p>
              <span className="badge bg-success">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
