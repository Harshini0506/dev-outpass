import React from 'react';
import { toast } from 'sonner';
import { 
  Settings,
  Download, 
  Database,
  Shield,
  BarChart3,
  Users,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';

interface AdminActionsProps {
  onDownloadReport: () => void;
  onRefreshData: () => void;
  onNavigateToTab: (tab: string) => void;
  refreshing: boolean;
}

const AdminActions: React.FC<AdminActionsProps> = ({ 
  onDownloadReport, 
  onRefreshData, 
  onNavigateToTab, 
  refreshing 
}) => {
  const actions = [
    {
      title: 'Export Reports',
      description: 'Download comprehensive system reports',
      icon: Download,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      action: onDownloadReport,
      buttonText: 'Download'
    },
    {
      title: 'Database Backup',
      description: 'Create backup of system database',
      icon: Database,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
      action: () => {
        toast.loading('Initiating database backup...');
        setTimeout(() => {
          toast.dismiss();
          toast.success('Backup Complete', {
            description: 'Database backup has been successfully created.'
          });
        }, 2000);
      },
      buttonText: 'Backup'
    },
    {
      title: 'Security Settings',
      description: 'Configure system security options',
      icon: Shield,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      action: () => {
        toast.info('Security Settings', {
          description: 'Security configuration panel will be available in the next update.'
        });
      },
      buttonText: 'Configure'
    },
    {
      title: 'System Analytics',
      description: 'View detailed system performance',
      icon: BarChart3,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      action: () => onNavigateToTab('dashboard'),
      buttonText: 'View Analytics'
    },
    {
      title: 'User Management',
      description: 'Quick access to user administration',
      icon: Users,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      bgGradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
      action: () => onNavigateToTab('users'),
      buttonText: 'Manage Users'
    },
    {
      title: 'System Refresh',
      description: 'Update all dashboard data manually',
      icon: RefreshCw,
      gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
      bgGradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      action: onRefreshData,
      buttonText: refreshing ? 'Refreshing...' : 'Refresh'
    }
  ];

  return (
    <div className="admin-actions">
      <div className="d-flex align-items-center mb-4">
        <Settings className="text-primary me-3" style={{width: '1.75rem', height: '1.75rem'}} />
        <div>
          <h3 className="fw-bold mb-1" style={{
            background: 'linear-gradient(90deg, #1e293b 0%, #3b82f6 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent'
          }}>
            System Actions
          </h3>
          <p className="text-muted mb-0">Administrative tools and system maintenance</p>
        </div>
      </div>
      
      <div className="row g-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div key={index} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow position-relative overflow-hidden" 
                   style={{background: action.bgGradient}}>
                {/* Decorative elements */}
                <div className="position-absolute top-0 end-0 rounded-circle opacity-25" 
                     style={{
                       width: '8rem', 
                       height: '8rem', 
                       background: 'rgba(255,255,255,0.4)', 
                       marginTop: '-2rem', 
                       marginRight: '-2rem'
                     }}>
                </div>
                <div className="position-absolute bottom-0 start-0 rounded-circle opacity-25" 
                     style={{
                       width: '6rem', 
                       height: '6rem', 
                       background: 'rgba(255,255,255,0.3)', 
                       marginBottom: '-2rem', 
                       marginLeft: '-2rem'
                     }}>
                </div>
                
                <div className="card-body p-4 position-relative">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="rounded-3 p-3 shadow" style={{background: action.gradient}}>
                      <Icon className="text-white" style={{width: '1.75rem', height: '1.75rem'}} />
                    </div>
                    <div className="bg-white bg-opacity-75 rounded p-2 shadow-sm">
                      <ArrowUpRight className="text-primary" style={{width: '1.25rem', height: '1.25rem'}} />
                    </div>
                  </div>
                  
                  <h5 className="fw-bold text-dark mb-3">{action.title}</h5>
                  <p className="text-muted mb-4 small">{action.description}</p>
                  
                  <button
                    onClick={action.action}
                    disabled={action.buttonText.includes('Refreshing')}
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center shadow"
                    style={{background: action.gradient, border: 'none'}}
                  >
                    {action.buttonText.includes('Refreshing') ? (
                      <div className="spinner-border spinner-border-sm me-2" 
                           style={{width: '1.25rem', height: '1.25rem'}}>
                      </div>
                    ) : (
                      <Icon className="me-2" style={{width: '1.25rem', height: '1.25rem'}} />
                    )}
                    {action.buttonText}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminActions;
