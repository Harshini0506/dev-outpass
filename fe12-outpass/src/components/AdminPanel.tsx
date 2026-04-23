import { useState, useEffect } from 'react';
import { api } from '../api';
import { toast } from 'sonner';
import '../styles/admin-dashboard.css';
import '../styles/admin-mobile.css';

// Import modular components
import AdminNavigation from './admin/AdminNavigation';
import DashboardOverview from './admin/DashboardOverview';
import UserManagement from './admin/UserManagement';
import StudentMentorMapping from './admin/StudentMentorMapping';
import TakeActions from './admin/TakeActions';
import OutpassReports from './admin/OutpassReports';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'MENTOR' | 'HOD' | 'SECURITY';
  createdAt: string;
  mobile?: string;
  parentMobile?: string;
}

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

const AdminPanel = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayActivity, setTodayActivity] = useState<TodayActivity | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mappingChangeDetected, setMappingChangeDetected] = useState(false);

  // API Functions - Direct calls to your backend routes
  const fetchUsers = async () => {
    try {
      console.log('🔍 Fetching users from /api/admin/users');
      const response = await api.get('/admin/users');
      console.log('✅ Users fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast.error('Failed to Load Users', {
        description: 'Unable to fetch user data. Please try again.'
      });
      throw new Error('Failed to fetch users');
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔍 Fetching stats from /api/admin/stats');
      const response = await api.get('/admin/stats');
      console.log('✅ Stats fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      toast.error('Failed to Load Statistics', {
        description: 'Unable to fetch dashboard statistics. Please try again.'
      });
      throw new Error('Failed to fetch statistics');
    }
  };

  const fetchOutpassReports = async () => {
    try {
      console.log('🔍 Fetching outpass reports from /api/admin/outpass-reports');
      const response = await api.get('/admin/outpass-reports?limit=10');
      console.log('✅ Outpass reports fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching outpass reports:', error);
      toast.error('Failed to Load Reports', {
        description: 'Unable to fetch outpass reports. Please try again.'
      });
      throw new Error('Failed to fetch outpass reports');
    }
  };

  const deleteUser = async (userId: string, force = false) => {
    try {
      const url = force ? `/admin/users/${userId}?force=true` : `/admin/users/${userId}`;
      console.log(`🔍 Deleting user ${userId} via /api${url} (force: ${force})`);
      toast.loading(`${force ? 'Force deleting' : 'Deleting'} user...`);
      const response = await api.delete(url);
      console.log('✅ User deleted successfully', response.data);
      setUsers(users.filter(u => u.id !== userId));
      toast.dismiss();
      
      if (force && response.data.deletedDependencies) {
        const deps = response.data.deletedDependencies;
        const deletedItems = [];
        if (deps.gatePasses > 0) deletedItems.push(`${deps.gatePasses} outpass${deps.gatePasses > 1 ? 'es' : ''}`);
        if (deps.passesToReview > 0) deletedItems.push(`${deps.passesToReview} review${deps.passesToReview > 1 ? 's' : ''}`);
        if (deps.studentMappings > 0) deletedItems.push(`${deps.studentMappings} student mapping${deps.studentMappings > 1 ? 's' : ''}`);
        if (deps.mentorMappings > 0) deletedItems.push(`${deps.mentorMappings} mentor mapping${deps.mentorMappings > 1 ? 's' : ''}`);
        
        toast.success('User and Dependencies Deleted', {
          description: `Successfully deleted user and ${deletedItems.join(', ')}.`
        });
      } else {
        toast.success('User Deleted', {
          description: 'User has been successfully removed from the system.'
        });
      }
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      toast.dismiss();
      
      if (error.response?.status === 400 && error.response?.data?.details) {
        // Show detailed dependency information
        const details = error.response.data.details;
        const dependencies = [];
        
        if (details.gatePasses > 0) {
          dependencies.push(`${details.gatePasses} outpass application${details.gatePasses > 1 ? 's' : ''}`);
        }
        if (details.passesToReview > 0) {
          dependencies.push(`${details.passesToReview} outpass${details.passesToReview > 1 ? 'es' : ''} to review`);
        }
        if (details.studentMappings > 0) {
          dependencies.push(`${details.studentMappings} student mapping${details.studentMappings > 1 ? 's' : ''}`);
        }
        if (details.mentorMappings > 0) {
          dependencies.push(`${details.mentorMappings} mentor mapping${details.mentorMappings > 1 ? 's' : ''}`);
        }
        
        toast.warning('Cannot Delete User', {
          description: `This user has active dependencies: ${dependencies.join(', ')}. Use the enhanced delete dialog to force delete with dependencies.`,
          duration: 8000 // Show longer for detailed message
        });
      } else {
        // Generic error for other types of failures
        const errorMessage = error.response?.data?.error || 'Unable to delete the user. Please try again.';
        toast.error('Failed to Delete User', {
          description: errorMessage
        });
      }
      
      throw new Error('Failed to delete user');
    }
  };

  const downloadReport = async () => {
    try {
      console.log('🔍 Downloading report from /api/admin/download-outpass-report');
      toast.loading('Preparing report for download...');
      const response = await api.post('/admin/download-outpass-report', 
        { format: 'excel' }, 
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `outpass-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Report downloaded successfully');
      toast.dismiss();
      toast.success('Report Downloaded', {
        description: 'Outpass report has been successfully downloaded.'
      });
    } catch (error) {
      console.error('❌ Error downloading report:', error);
      toast.dismiss();
      toast.error('Failed to Download Report', {
        description: 'Unable to generate the report. Please try again.'
      });
      throw new Error('Failed to download report');
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      console.log('🔄 Fetching all dashboard data...');
      
      const [usersData, statsData, outpassData] = await Promise.all([
        fetchUsers(),
        fetchStats(),
        fetchOutpassReports()
      ]);

      setUsers(usersData.users || usersData);
      setStats(statsData);
      setTodayActivity(outpassData.summary?.today || outpassData.today);
      
      console.log('✅ All dashboard data loaded successfully');
      if (!loading) {
        toast.success('Data Refreshed', {
          description: 'Dashboard data has been updated successfully.'
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error);
      const errorMessage = error.message || 'Failed to load dashboard data. Please try again.';
      setError(errorMessage);
      toast.error('Failed to Load Dashboard', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle download report
  const handleDownloadReport = async () => {
    try {
      await downloadReport();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to download report';
      setError(errorMessage);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string, force = false) => {
    try {
      await deleteUser(userId, force);
    } catch (error: any) {
      setError(error.message || 'Failed to delete user');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5 text-center">
                <div className="spinner-border text-primary mb-4" style={{width: '3rem', height: '3rem'}}></div>
                <h5 className="card-title fw-semibold text-dark mb-2">Loading Admin Dashboard</h5>
                <p className="text-muted mb-0">Fetching the latest data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container-fluid py-4">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Navigation */}
      <AdminNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content Area */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
          
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <DashboardOverview 
                  stats={stats}
                  todayActivity={todayActivity}
                  loading={false}
                />
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <UserManagement 
                  users={users}
                  loading={false}
                  onDeleteUser={handleDeleteUser}
                  onRefreshUsers={fetchDashboardData}
                />
              )}

              {/* Student-Mentor Mapping Tab */}
              {activeTab === 'mapping' && (
                <StudentMentorMapping 
                  onRoleChange={() => setMappingChangeDetected(true)}
                />
              )}

              {/* Take Actions Tab */}
              {activeTab === 'actions' && (
                <TakeActions 
                  onNavigateToMapping={() => setActiveTab('mapping')}
                  onNavigateToUsers={() => setActiveTab('users')}
                />
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <OutpassReports 
                  onDownloadReport={handleDownloadReport}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Notification */}
      {mappingChangeDetected && (
        <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
          <div className="alert alert-info alert-dismissible fade show shadow" role="alert">
            <strong>Role changes detected!</strong> Student-mentor mappings have been updated.
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMappingChangeDetected(false)}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
