import React from 'react';
import { 
  BarChart3,
  RefreshCw,
  Download,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';

interface AdminHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
  onDownloadReport: () => void;
  error: string | null;
  onClearError: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  refreshing, 
  onRefresh, 
  onDownloadReport, 
  error, 
  onClearError 
}) => {
  return (
    <>
      {/* Error Alert */}
      {error && (
        <div className="mb-3">
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <AlertCircle className="me-2" style={{width: '1rem', height: '1rem'}} />
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClearError}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}

      {/* Professional Header */}
      <div className="mb-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8 d-flex align-items-center">
                <div className="me-4">
                  <div className="bg-primary rounded-3 p-3 d-inline-flex">
                    <BarChart3 className="text-white" style={{width: '2.5rem', height: '2.5rem'}} />
                  </div>
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1 text-primary">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted mb-2 fw-medium">VNR Outpass Management System</p>
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-success-subtle text-success d-flex align-items-center fw-medium">
                      <div className="bg-success rounded-circle me-1" style={{width: '0.5rem', height: '0.5rem'}}></div>
                      System Online
                    </span>
                    <small className="text-muted">Last updated: just now</small>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 d-flex align-items-center justify-content-end gap-3">
                <button
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="btn btn-outline-secondary d-flex align-items-center"
                >
                  {refreshing ? (
                    <div className="spinner-border spinner-border-sm text-primary me-2" 
                         style={{width: '1rem', height: '1rem'}}>
                    </div>
                  ) : (
                    <RefreshCw className="me-2" style={{width: '1rem', height: '1rem'}} />
                  )}
                  <span className="fw-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                
                <div className="vr"></div>
                
                <button
                  onClick={onDownloadReport}
                  className="btn btn-primary d-flex align-items-center"
                >
                  <Download className="me-2" style={{width: '1.25rem', height: '1.25rem'}} />
                  <span className="fw-medium">Export Report</span>
                  <ArrowUpRight className="ms-1" style={{width: '1rem', height: '1rem'}} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHeader;
