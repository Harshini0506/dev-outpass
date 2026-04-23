import React from 'react';
import { 
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Activity,
  Calendar,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalMentors: number;
  totalGatePasses: number;
  pendingPasses: number;
  roleDistribution: {
    STUDENT: number;
    MENTOR: number;
    HOD: number;
    SECURITY: number;
  };
}

interface TodayActivity {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  utilized: number;
}

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  todayActivity: TodayActivity | null;
  loading: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  stats, 
  todayActivity, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats || !todayActivity) {
    return (
      <div className="alert alert-warning" role="alert">
        No dashboard data available
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        {[
          { 
            title: 'Total Users', 
            value: stats.totalUsers, 
            icon: Users, 
            color: 'primary',
            change: '+12%',
            changeType: 'positive'
          },
          { 
            title: 'Total Outpasses', 
            value: stats.totalGatePasses, 
            icon: CheckCircle, 
            color: 'success',
            change: '+8%',
            changeType: 'positive'
          },
          { 
            title: 'Pending Requests', 
            value: stats.pendingPasses, 
            icon: Clock, 
            color: 'warning',
            change: '-5%',
            changeType: 'negative'
          },
          { 
            title: 'Active Students', 
            value: stats.totalStudents, 
            icon: Activity, 
            color: 'info',
            change: '+15%',
            changeType: 'positive'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="col-md-6 col-lg-3">
              <div className="card stats-card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className={`stats-icon bg-${stat.color}`}>
                      <Icon className="text-white" style={{width: '1.5rem', height: '1.5rem'}} />
                    </div>
                  </div>
                  <h6 className="stats-title text-muted fw-semibold mb-2">{stat.title}</h6>
                  <h3 className="stats-value fw-bold text-dark mb-2">{stat.value.toLocaleString()}</h3>
                  <div className={`stats-change small ${stat.changeType === 'positive' ? 'text-success' : 'text-danger'}`}>
                    <span className="fw-medium">{stat.change}</span>
                    <span className="text-muted ms-1">vs last month</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Activity */}
      <div className="card activity-card border-0 shadow-lg overflow-hidden">
        <div className="card-header activity-header border-bottom bg-transparent py-4">
          <div className="row align-items-center">
            <div className="col d-flex align-items-center">
              <div className="activity-icon me-3">
                <Activity style={{width: '1.5rem', height: '1.5rem'}} />
              </div>
              <div>
                <h4 className="activity-title fw-bold mb-1">Today's Activity</h4>
                <p className="activity-subtitle text-muted mb-0 fw-medium">Real-time outpass overview</p>
              </div>
            </div>
            <div className="col-auto d-flex align-items-center text-muted small">
              <Calendar className="me-1" style={{width: '1rem', height: '1rem'}} />
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
        
        <div className="card-body p-4">
          <div className="row g-4">
            {[
              { label: 'Total', value: todayActivity.total, color: '#3b82f6', icon: Activity },
              { label: 'Approved', value: todayActivity.approved, color: '#10b981', icon: CheckCircle },
              { label: 'Pending', value: todayActivity.pending, color: '#f59e0b', icon: Clock },
              { label: 'Rejected', value: todayActivity.rejected, color: '#ef4444', icon: BarChart3 },
              { label: 'Utilized', value: todayActivity.utilized, color: '#8b5cf6', icon: TrendingUp }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="col-6 col-md-2">
                  <div className="activity-item text-center p-4 bg-white rounded-3 shadow-sm border h-100">
                    <div 
                      className="activity-item-icon rounded-3 p-3 mx-auto mb-3 shadow-sm" 
                      style={{
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                        width: 'fit-content'
                      }}
                    >
                      <Icon className="text-white" style={{width: '1.75rem', height: '1.75rem'}} />
                    </div>
                    <div className="activity-item-value h2 fw-bold mb-2" style={{color: item.color}}>
                      {item.value}
                    </div>
                    <div className="activity-item-label small text-muted fw-semibold text-uppercase">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
