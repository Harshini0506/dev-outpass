import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../api';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import './ContactAdmin.css';

const ContactAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Automatically redirect users with roles to their respective dashboards
  useRoleRedirect({ 
    redirectFromContactAdmin: true,
    delay: 500 // Faster redirect for better UX
  });

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Logout error:', error);
        // Fallback navigation
        window.location.href = '/';
      }
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleRoleRequest = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/role-request', {
        requestedRole: selectedRole,
        reason: reason.trim()
      });

      setRequestSubmitted(true);
      toast.success('Role request submitted successfully! An admin will review your request.');
      
      // Poll for role updates every 5 seconds
      const pollInterval = setInterval(async () => {
        try {
          // Refresh user data to check if role was assigned
          window.location.reload();
        } catch (error) {
          console.error('Error polling for role update:', error);
        }
      }, 5000);

      // Clear interval after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 120000);

    } catch (error: any) {
      console.error('Error submitting role request:', error);
      if (error.response?.data?.error === 'You already have a pending role request') {
        toast.error('You already have a pending role request. Please wait for admin approval.');
        setRequestSubmitted(true);
      } else {
        toast.error('Failed to submit role request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-admin-container">
      <div className="contact-admin-card">
        <div className="contact-admin-header">
          <h1>🔐 Access Pending</h1>
          <p className="welcome-text">Welcome to VNR OutPass System, {user?.name}!</p>
        </div>
        
        <div className="contact-admin-content">
          <div className="status-info">
            <h2>Your Account Status</h2>
            <div className="status-details">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Role:</strong> <span className="pending-role">Pending Assignment</span></p>
            </div>
          </div>

          <div className="action-required">
            <h3>🎯 Action Required</h3>
            <p>
              Your account has been created successfully, but you need role assignment to access the system features.
            </p>
            
            {!requestSubmitted ? (
              <div className="role-request-form">
                <h4>Request Role Assignment:</h4>
                <div className="form-group">
                  <label htmlFor="role-select">Select your role:</label>
                  <select 
                    id="role-select"
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="role-select"
                  >
                    <option value="">-- Select Role --</option>
                    <option value="STUDENT">Student</option>
                    <option value="MENTOR">Mentor/Faculty</option>
                    <option value="HOD">HOD/Admin</option>
                    <option value="SECURITY">Security</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="reason">Reason (optional):</label>
                  <textarea 
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly explain why you need this role..."
                    className="reason-textarea"
                    rows={3}
                  />
                </div>

                <button 
                  onClick={handleRoleRequest}
                  disabled={isSubmitting || !selectedRole}
                  className="request-role-btn"
                >
                  {isSubmitting ? '🔄 Submitting...' : '📤 Submit Role Request'}
                </button>
              </div>
            ) : (
              <div className="request-submitted">
                <div className="success-message">
                  ✅ <strong>Role request submitted successfully!</strong>
                </div>
                <p>Your request has been sent to the administrators. You will be automatically redirected once your role is assigned.</p>
                <div className="polling-indicator">
                  <span className="pulse-dot"></span>
                  Checking for role assignment...
                </div>
              </div>
            )}

            <div className="next-steps">
              <h4>Next Steps:</h4>
              <ol>
                <li>Submit your role request above</li>
                <li>Wait for administrator approval</li>
                <li>You'll be automatically redirected once approved</li>
                <li>Or refresh manually to check status</li>
              </ol>
            </div>
          </div>

          <div className="contact-info">
            <h3>📞 Contact Information</h3>
            <div className="contact-details">
              <p><strong>System Admin:</strong> IT Department</p>
              <p><strong>Email:</strong> admin@vnrvjiet.in</p>
              <p><strong>Phone:</strong> +91-XXX-XXX-XXXX</p>
              <p><strong>Office:</strong> Computer Center, VNR VJIET</p>
            </div>
          </div>
        </div>

        <div className="contact-admin-actions">
          <button 
            onClick={handleRefresh}
            className="refresh-btn"
            title="Check if your role has been assigned"
          >
            🔄 Check Status
          </button>
          <button 
            onClick={handleGoHome}
            className="home-btn"
          >
            🏠 Go Home
          </button>
          <button 
            onClick={handleLogout} 
            className="logout-btn"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactAdmin;
