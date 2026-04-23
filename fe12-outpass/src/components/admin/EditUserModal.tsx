import React, { useState } from 'react';
import { toast } from 'sonner';
import { Edit, User, Mail, Phone, UserCheck } from 'lucide-react';
import { api } from '../../api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'MENTOR' | 'HOD' | 'SECURITY';
  createdAt: string;
  mobile?: string;
  parentMobile?: string;
}

interface EditUserModalProps {
  show: boolean;
  onHide: () => void;
  onUserUpdated: () => void;
  user: User | null;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ show, onHide, onUserUpdated, user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    parentMobile: user?.parentMobile || '',
    role: user?.role || 'STUDENT'
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        parentMobile: user.parentMobile || '',
        role: user.role
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate that parent mobile is provided when role is STUDENT
    if (formData.role === 'STUDENT' && !formData.parentMobile.trim()) {
      toast.error('Validation Error', {
        description: 'Parent mobile number is required for students.'
      });
      return;
    }
    
    setLoading(true);

    try {
      toast.loading('Updating user...');
      
      // Track which updates were made
      const updates = [];
      
      // Update role if changed
      if (formData.role !== user.role) {
        await api.put(`/admin/users/${user.id}/role`, { role: formData.role });
        updates.push('role');
      }
      
      // Update mobile numbers if changed
      const mobileChanged = formData.mobile !== user.mobile;
      const parentMobileChanged = formData.parentMobile !== user.parentMobile;
      
      if (mobileChanged || parentMobileChanged) {
        // Clear parent mobile if role is not STUDENT
        const parentMobileToSend = formData.role === 'STUDENT' ? formData.parentMobile : '';
        
        await api.put(`/admin/users/${user.id}/mobile`, { 
          mobile: formData.mobile,
          parentMobile: parentMobileToSend 
        });
        
        if (mobileChanged && parentMobileChanged) {
          updates.push('mobile and parent mobile');
        } else if (mobileChanged) {
          updates.push('mobile');
        } else if (parentMobileChanged) {
          updates.push('parent mobile');
        }
      }
      
      toast.dismiss();
      if (updates.length > 0) {
        toast.success('User Updated', {
          description: `${user.name}'s ${updates.join(' and ')} has been successfully updated.`
        });
      } else {
        toast.info('No Changes', {
          description: 'No changes were made to the user.'
        });
      }
      
      onUserUpdated();
      onHide();
    } catch (error: any) {
      toast.dismiss();
      toast.error('Failed to Update User', {
        description: error.response?.data?.message || 'Unable to update user. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If role is changing away from STUDENT, clear parent mobile
    if (name === 'role' && value !== 'STUDENT') {
      setFormData(prev => ({
        ...prev,
        role: value as 'STUDENT' | 'MENTOR' | 'HOD' | 'SECURITY',
        parentMobile: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!show || !user) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title d-flex align-items-center">
              <Edit className="me-2" size={20} />
              Edit User: {user.name}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onHide}
              disabled={loading}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <User size={16} className="me-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                  <small className="text-muted">Name cannot be changed</small>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <Mail size={16} className="me-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                  <small className="text-muted">Email cannot be changed</small>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <Phone size={16} className="me-1" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number (optional)"
                  />
                </div>
                
                {formData.role === 'STUDENT' && (
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      <Phone size={16} className="me-1" />
                      Parent Mobile Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="parentMobile"
                      value={formData.parentMobile}
                      onChange={handleChange}
                      placeholder="Enter parent mobile number"
                      required
                    />                  </div>
                )}
                
                <div className="col-12">
                  <label className="form-label fw-medium">
                    <UserCheck size={16} className="me-1" />
                    User Role *
                  </label>
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="STUDENT">Student</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="SECURITY">Security</option>
                    <option value="HOD">HOD</option>
                  </select>
                  <small className="text-muted">Change the user's role in the system</small>
                </div>
              </div>
            </div>
            
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onHide}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit size={16} className="me-1" />
                    Update User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
