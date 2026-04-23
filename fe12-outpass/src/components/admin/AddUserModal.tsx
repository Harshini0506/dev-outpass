import React, { useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Phone, UserCheck } from 'lucide-react';
import { api } from '../../api';

interface AddUserModalProps {
  show: boolean;
  onHide: () => void;
  onUserAdded: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  mobile: string;
  parentMobile: string;
  role: 'STUDENT' | 'MENTOR' | 'HOD' | 'SECURITY';
}

const AddUserModal: React.FC<AddUserModalProps> = ({ show, onHide, onUserAdded }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    mobile: '',
    parentMobile: '',
    role: 'STUDENT'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that parent mobile is provided for students
    if (formData.role === 'STUDENT' && !formData.parentMobile.trim()) {
      toast.error('Validation Error', {
        description: 'Parent mobile number is required for students.'
      });
      return;
    }
    
    setLoading(true);

    try {
      toast.loading('Creating user...');
      
      // Prepare the data to send (exclude parentMobile for non-students)
      const submitData = formData.role === 'STUDENT' 
        ? formData 
        : { ...formData, parentMobile: '' };
        
      await api.post('/admin/users', submitData);
      
      toast.dismiss();
      toast.success('User Created', {
        description: `${formData.name} has been successfully added to the system.`
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        mobile: '',
        parentMobile: '',
        role: 'STUDENT'
      });
      
      onUserAdded();
      onHide();
    } catch (error: any) {
      toast.dismiss();
      toast.error('Failed to Create User', {
        description: error.response?.data?.message || 'Unable to create user. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If role is changing and not STUDENT, clear parent mobile
    if (name === 'role' && value !== 'STUDENT') {
      setFormData({
        ...formData,
        role: value as 'STUDENT' | 'MENTOR' | 'HOD' | 'SECURITY',
        parentMobile: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title d-flex align-items-center">
              <User className="me-2" size={20} />
              Add New User
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
                  <div className="form-text">
                    Choose the appropriate role for this user in the system.
                  </div>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <User size={16} className="me-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <Mail size={16} className="me-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <Phone size={16} className="me-1" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    placeholder="Enter mobile number"
                  />
                </div>
                
                {/* Conditional Parent Mobile Field - Only for Students */}
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
                      required
                      placeholder="Enter parent mobile number"
                    />

                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-secondary"
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
                    Creating...
                  </>
                ) : (
                  <>
                    <User size={16} className="me-1" />
                    Create User
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

export default AddUserModal;
