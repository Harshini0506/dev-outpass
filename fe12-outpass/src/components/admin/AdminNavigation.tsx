import React from 'react';
import { 
  TrendingUp,
  Users,
  UserCheck,
  FileText,
  Bell
} from 'lucide-react';

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: TrendingUp, 
      description: 'Overview & Analytics' 
    },
    { 
      id: 'users', 
      name: 'Users', 
      icon: Users, 
      description: 'User Management' 
    },
    { 
      id: 'mapping', 
      name: 'Mapping', 
      icon: UserCheck, 
      description: 'Student-Mentor' 
    },
    { 
      id: 'actions', 
      name: 'Take Actions', 
      icon: Bell, 
      description: 'Notifications' 
    },
    { 
      id: 'reports', 
      name: 'Reports', 
      icon: FileText, 
      description: 'Event Logs' 
    }
  ];

  return (
    <div className="mb-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-2">
          {/* Desktop Navigation */}
          <nav className="nav nav-pills justify-content-center d-none d-md-flex" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`nav-link d-flex flex-column align-items-center py-3 px-4 mx-1 border-0 transition-all ${
                    isActive
                      ? 'active text-white'
                      : 'text-muted'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
                  } : {}}
                >
                  <Icon className="mb-2" style={{width: '1.5rem', height: '1.5rem'}} />
                  <div className="fw-semibold">{tab.name}</div>
                  <div className={`small ${isActive ? 'text-white-50' : 'text-muted'}`}>
                    {tab.description}
                  </div>
                </button>
              );
            })}
          </nav>
          
          {/* Mobile Navigation */}
          <nav className="d-md-none" role="tablist">
            <div className="row g-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <div key={tab.id} className="col-6 col-sm-3">
                    <button
                      onClick={() => onTabChange(tab.id)}
                      className={`btn w-100 d-flex flex-column align-items-center py-2 px-2 border-0 ${
                        isActive
                          ? 'btn-primary text-white'
                          : 'btn-outline-secondary text-muted'
                      }`}
                      style={{
                        minHeight: '70px',
                        fontSize: '0.875rem',
                        borderRadius: '8px'
                      }}
                    >
                      <Icon className="mb-1" style={{width: '1.25rem', height: '1.25rem'}} />
                      <div className="fw-semibold" style={{fontSize: '0.75rem', lineHeight: '1.2'}}>
                        {tab.name}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;
