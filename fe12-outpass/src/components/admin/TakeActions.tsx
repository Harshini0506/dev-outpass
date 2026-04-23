import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  Users, 
  UserX, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle,
  Bell,
  UserCheck,
  MessageSquare,
  Clock
} from 'lucide-react';
import { api } from '../../api';

interface PendingAction {
  type: string;
  description: string;
  userId: string;
  userName: string;
  oldRole?: string;
  newRole?: string;
  affectedCount: number;
  priority?: 'high' | 'medium' | 'low';
  students?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  users?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  // Role request specific fields
  notificationId?: string;
  requestedRole?: string;
  reason?: string;
  currentRole?: string;
  userEmail?: string;
  createdAt?: string;
}

interface UnmappedStudent {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  createdAt: string;
}

interface TakeActionsProps {
  onNavigateToMapping?: () => void;
  onNavigateToUsers?: () => void;
}

const TakeActions: React.FC<TakeActionsProps> = ({ 
  onNavigateToMapping, 
  onNavigateToUsers 
}) => {
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [unmappedStudents, setUnmappedStudents] = useState<UnmappedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPendingActions(),
        fetchUnmappedStudents()
      ]);
    } catch (error) {
      toast.error('Failed to Load Data', {
        description: 'Unable to fetch notification data.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingActions = async () => {
    try {
      const response = await api.get('/admin/pending-actions');
      setPendingActions(response.data.actions || []);
    } catch (error) {
      console.error('Error fetching pending actions:', error);
    }
  };

  const fetchUnmappedStudents = async () => {
    try {
      const response = await api.get('/admin/student-mentor-mappings');
      const { studentsWithoutMentors } = response.data;
      setUnmappedStudents(studentsWithoutMentors || []);
    } catch (error) {
      console.error('Error fetching unmapped students:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success('Data Refreshed', {
      description: 'Notification data has been updated.'
    });
  };

  const handleUnmapStudents = async (action: PendingAction) => {
    try {
      setActionLoading(action.userId);
      
      // This would typically involve updating the user's role and unmapping students
      // The actual implementation depends on your backend API
      await api.put(`/admin/users/${action.userId}/role`, {
        role: action.newRole
      });

      toast.success('Students Unmapped', {
        description: `${action.affectedCount} students have been unmapped and can be reassigned.`
      });

      // Refresh data to reflect changes
      await fetchAllData();
    } catch (error) {
      toast.error('Failed to Process Action', {
        description: 'Unable to unmap students. Please try again.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcessNoMentorAlerts = async (action: PendingAction, actionType: 'remove' | 'reassign', mentorId?: string) => {
    try {
      setActionLoading(action.userId);
      
      const payload: any = {
        action: actionType,
        studentIds: action.students?.map(s => s.id) || []
      };

      if (actionType === 'reassign' && mentorId) {
        payload.mentorId = mentorId;
      }

      const response = await api.post('/admin/process-no-mentor-alerts', payload);

      toast.success('No Mentor Alerts Processed', {
        description: response.data.message
      });

      // Refresh data to reflect changes
      await fetchAllData();
    } catch (error: any) {
      toast.error('Failed to Process Action', {
        description: error.response?.data?.error || 'Unable to process no mentor alerts. Please try again.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleRequest = async (action: PendingAction, actionType: 'approve' | 'reject', assignedRole?: string) => {
    if (!action.notificationId) return;

    try {
      setActionLoading(action.notificationId);

      const payload = {
        action: actionType,
        ...(actionType === 'approve' && assignedRole ? { assignedRole } : {})
      };

      const response = await api.put(`/admin/notifications/${action.notificationId}/resolve`, payload);

      toast.success(
        actionType === 'approve' ? 'Role Request Approved' : 'Role Request Rejected', 
        {
          description: response.data.message
        }
      );

      // Refresh data to reflect changes
      await fetchAllData();
    } catch (error: any) {
      toast.error('Failed to Process Request', {
        description: error.response?.data?.error || 'Unable to process role request. Please try again.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const totalNotifications = pendingActions.length + (unmappedStudents.length > 0 ? 1 : 0);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="take-actions">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center">
          <div className="position-relative me-3">
            <Bell className="text-primary" style={{width: '1.75rem', height: '1.75rem'}} />
            {totalNotifications > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {totalNotifications}
                <span className="visually-hidden">notifications</span>
              </span>
            )}
          </div>
          <div>
            <h3 className="fw-bold mb-1 text-primary">Take Actions</h3>
            <p className="text-muted mb-0 small">
              {totalNotifications > 0 
                ? `${totalNotifications} item${totalNotifications > 1 ? 's' : ''} requiring your attention`
                : 'All systems running smoothly'
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-outline-primary d-flex align-items-center btn-sm"
        >
          <RefreshCw 
            className={`me-2 ${refreshing ? 'spinner-border spinner-border-sm' : ''}`} 
            size={16} 
          />
          <span className="d-none d-sm-inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          <span className="d-sm-none">↻</span>
        </button>
      </div>

      {/* No Notifications State */}
      {totalNotifications === 0 && (
        <div className="text-center py-5">
          <div className="bg-success bg-opacity-10 rounded-circle p-4 d-inline-flex mb-3">
            <CheckCircle className="text-success" size={48} />
          </div>
          <h4 className="fw-semibold text-success mb-2">All Caught Up!</h4>
          <p className="text-muted mb-0">
            No pending actions or notifications at this time.
          </p>
        </div>
      )}

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="mb-4">
          <h5 className="fw-semibold mb-3 d-flex align-items-center">
            <MessageSquare size={20} className="me-2 text-warning" />
            System Notifications
            <span className="badge bg-warning ms-2">{pendingActions.length}</span>
          </h5>
          
          <div className="row g-3">
            {pendingActions.map((action, index) => (
              <div key={`${action.userId}-${index}`} className="col-12">
                {action.type === 'unmap_students' && (
                  <div className="card border-warning bg-warning-subtle">
                    <div className="card-body">
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="d-flex align-items-start flex-grow-1">
                          <div className="bg-warning rounded-circle p-2 me-3 flex-shrink-0">
                            <UserX className="text-white" size={20} />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="fw-semibold text-warning-emphasis mb-2">
                              {action.userName} - Role Change Impact
                            </h6>
                            <p className="text-warning-emphasis mb-2 small">
                              {action.description}
                            </p>
                            {action.students && (
                              <div className="mt-2">
                                <small className="text-muted d-block mb-2">
                                  Affected Students ({action.affectedCount}):
                                </small>
                                <div className="d-flex flex-wrap gap-1">
                                  {action.students.slice(0, 3).map((student) => (
                                    <span 
                                      key={student.id} 
                                      className="badge bg-warning bg-opacity-25 text-warning-emphasis"
                                    >
                                      {student.name}
                                    </span>
                                  ))}
                                  {action.students.length > 3 && (
                                    <span className="badge bg-warning bg-opacity-25 text-warning-emphasis">
                                      +{action.students.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2 flex-shrink-0 flex-wrap">
                          <button
                            onClick={() => handleUnmapStudents(action)}
                            disabled={actionLoading === action.userId}
                            className="btn btn-warning btn-sm d-flex align-items-center"
                          >
                            {actionLoading === action.userId ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-2" />
                                <span className="d-none d-sm-inline">Processing...</span>
                                <span className="d-sm-none">...</span>
                              </>
                            ) : (
                              <>
                                <UserCheck size={16} className="me-2" />
                                <span className="d-none d-md-inline">Reassign Students</span>
                                <span className="d-md-none">Reassign</span>
                              </>
                            )}
                          </button>
                          {onNavigateToUsers && (
                            <button
                              onClick={onNavigateToUsers}
                              className="btn btn-outline-warning btn-sm d-flex align-items-center"
                            >
                              <Users size={16} className="me-2" />
                              <span className="d-none d-md-inline">View Users</span>
                              <span className="d-md-none">Users</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {action.type === 'no_mentor_alert' && (
                  <div className="card border-danger bg-danger-subtle">
                    <div className="card-body">
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="d-flex align-items-start flex-grow-1">
                          <div className="bg-danger rounded-circle p-2 me-3 flex-shrink-0">
                            <AlertTriangle className="text-white" size={20} />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="fw-semibold text-danger-emphasis mb-2 d-flex align-items-center">
                              {action.userName}
                              {action.priority === 'high' && (
                                <span className="badge bg-danger ms-2">High Priority</span>
                              )}
                            </h6>
                            <p className="text-danger-emphasis mb-2 small">
                              {action.description}
                            </p>
                            {action.students && (
                              <div className="mt-2">
                                <small className="text-muted d-block mb-2">
                                  Students with "No mentor" ({action.affectedCount}):
                                </small>
                                <div className="d-flex flex-wrap gap-1">
                                  {action.students.slice(0, 3).map((student) => (
                                    <span 
                                      key={student.id} 
                                      className="badge bg-danger bg-opacity-25 text-danger-emphasis"
                                    >
                                      {student.name}
                                    </span>
                                  ))}
                                  {action.students.length > 3 && (
                                    <span className="badge bg-danger bg-opacity-25 text-danger-emphasis">
                                      +{action.students.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2 flex-shrink-0 flex-wrap">
                          <button
                            onClick={() => handleProcessNoMentorAlerts(action, 'remove')}
                            disabled={actionLoading === action.userId}
                            className="btn btn-outline-danger btn-sm d-flex align-items-center"
                          >
                            {actionLoading === action.userId ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-2" />
                                <span className="d-none d-sm-inline">Processing...</span>
                                <span className="d-sm-none">...</span>
                              </>
                            ) : (
                              <>
                                <UserX size={16} className="me-2" />
                                <span className="d-none d-md-inline">Remove Assignments</span>
                                <span className="d-md-none">Remove</span>
                              </>
                            )}
                          </button>
                          {onNavigateToMapping && (
                            <button
                              onClick={onNavigateToMapping}
                              className="btn btn-danger btn-sm d-flex align-items-center"
                            >
                              <UserCheck size={16} className="me-2" />
                              <span className="d-none d-md-inline">Assign Mentors</span>
                              <span className="d-md-none">Assign</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {action.type === 'new_user_role_requests' && (
                  <div className="card border-info bg-info-subtle">
                    <div className="card-body">
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="d-flex align-items-start flex-grow-1">
                          <div className="bg-info rounded-circle p-2 me-3 flex-shrink-0">
                            <Clock className="text-white" size={20} />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="fw-semibold text-info-emphasis mb-2 d-flex align-items-center">
                              {action.userName}
                              {action.priority === 'medium' && (
                                <span className="badge bg-info ms-2">Medium Priority</span>
                              )}
                            </h6>
                            <p className="text-info-emphasis mb-2 small">
                              {action.description}
                            </p>
                            {action.users && (
                              <div className="mt-2">
                                <small className="text-muted d-block mb-2">
                                  Recent Students ({action.affectedCount}):
                                </small>
                                <div className="d-flex flex-wrap gap-1">
                                  {action.users.slice(0, 3).map((user) => (
                                    <span 
                                      key={user.id} 
                                      className="badge bg-info bg-opacity-25 text-info-emphasis"
                                    >
                                      {user.name}
                                    </span>
                                  ))}
                                  {action.users.length > 3 && (
                                    <span className="badge bg-info bg-opacity-25 text-info-emphasis">
                                      +{action.users.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2 flex-shrink-0 flex-wrap">
                          <button
                            onClick={onNavigateToMapping}
                            className="btn btn-info btn-sm d-flex align-items-center"
                          >
                            <UserCheck size={16} className="me-2" />
                            <span className="d-none d-md-inline">Assign Mentors</span>
                            <span className="d-md-none">Assign</span>
                          </button>
                          {onNavigateToUsers && (
                            <button
                              onClick={onNavigateToUsers}
                              className="btn btn-outline-info btn-sm d-flex align-items-center"
                            >
                              <Users size={16} className="me-2" />
                              <span className="d-none d-md-inline">View Users</span>
                              <span className="d-md-none">Users</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {action.type === 'role_request' && (
                  <div className="card border-primary bg-primary-subtle">
                    <div className="card-body">
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="d-flex align-items-start flex-grow-1">
                          <div className="bg-primary rounded-circle p-2 me-3 flex-shrink-0">
                            <MessageSquare className="text-white" size={20} />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="fw-semibold text-primary-emphasis mb-2 d-flex align-items-center">
                              Role Assignment Request
                              {action.priority === 'high' && (
                                <span className="badge bg-danger ms-2">High Priority</span>
                              )}
                            </h6>
                            <p className="text-primary-emphasis mb-2">
                              <strong>{action.userName}</strong> ({action.userEmail}) has requested role assignment
                            </p>
                            <div className="mt-2">
                              <div className="row g-2">
                                <div className="col-md-6">
                                  <small className="text-muted d-block">Requested Role:</small>
                                  <span className="badge bg-primary">{action.requestedRole}</span>
                                </div>
                                <div className="col-md-6">
                                  <small className="text-muted d-block">Current Role:</small>
                                  <span className="badge bg-secondary">{action.currentRole}</span>
                                </div>
                              </div>
                              {action.reason && (
                                <div className="mt-2">
                                  <small className="text-muted d-block">Reason:</small>
                                  <p className="small mb-0 text-primary-emphasis">{action.reason}</p>
                                </div>
                              )}
                              <div className="mt-2">
                                <small className="text-muted d-block">Requested:</small>
                                <small className="text-primary-emphasis">
                                  {action.createdAt ? new Date(action.createdAt).toLocaleString() : 'Recently'}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2 flex-shrink-0 flex-column flex-sm-row">
                          <div className="dropdown">
                            <button
                              className="btn btn-success btn-sm dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              disabled={actionLoading === action.notificationId}
                            >
                              {actionLoading === action.notificationId ? (
                                <>
                                  <RefreshCw size={16} className="me-2 spinner-border spinner-border-sm" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={16} className="me-2" />
                                  Approve
                                </>
                              )}
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleRoleRequest(action, 'approve', 'STUDENT')}
                                >
                                  Approve as Student
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleRoleRequest(action, 'approve', 'MENTOR')}
                                >
                                  Approve as Mentor
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleRoleRequest(action, 'approve', 'HOD')}
                                >
                                  Approve as HOD
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleRoleRequest(action, 'approve', 'SECURITY')}
                                >
                                  Approve as Security
                                </button>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleRoleRequest(action, 'approve', action.requestedRole)}
                                >
                                  Approve as Requested ({action.requestedRole})
                                </button>
                              </li>
                            </ul>
                          </div>
                          <button
                            onClick={() => handleRoleRequest(action, 'reject')}
                            className="btn btn-outline-danger btn-sm"
                            disabled={actionLoading === action.notificationId}
                          >
                            <UserX size={16} className="me-2" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unmapped Students Alert */}
      {unmappedStudents.length > 0 && (
        <div className="mb-4">
          <h5 className="fw-semibold mb-3 d-flex align-items-center">
            <Clock size={20} className="me-2 text-info" />
            Students Awaiting Mentor Assignment
            <span className="badge bg-info ms-2">{unmappedStudents.length}</span>
          </h5>
          
          <div className="card border-info bg-info-subtle">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between">
                <div className="d-flex align-items-start">
                  <div className="bg-info rounded-circle p-3 me-4">
                    <UserX className="text-white" size={24} />
                  </div>
                  <div>
                    <h6 className="fw-bold text-info-emphasis mb-2">
                      {unmappedStudents.length} Student{unmappedStudents.length > 1 ? 's' : ''} Without Mentors
                    </h6>
                    <p className="text-info-emphasis mb-3">
                      These students need mentor assignment to access the outpass system.
                    </p>
                    <div className="alert alert-info border-info border-opacity-50 bg-info bg-opacity-25 mb-3">
                      <div className="d-flex align-items-center">
                        <AlertTriangle size={16} className="me-2" />
                        <small className="mb-0">
                          <strong>Impact:</strong> Students cannot apply for outpasses without mentor assignments.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onNavigateToMapping?.()}
                  className="btn btn-info d-flex align-items-center flex-shrink-0"
                >
                  <span className="d-none d-sm-inline">Assign Mentors</span>
                  <span className="d-sm-none">Assign</span>
                  <ArrowRight size={16} className="ms-2" />
                </button>
              </div>

              {/* Preview of unmapped students */}
              <div className="mt-4">
                <h6 className="fw-semibold mb-3 text-info-emphasis">Recent Additions:</h6>
                <div className="row g-2">
                  {unmappedStudents.slice(0, 4).map((student) => (
                    <div key={student.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                      <div className="card border-info border-opacity-50 bg-info bg-opacity-10">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-info bg-opacity-25 rounded-circle p-2 me-3 flex-shrink-0">
                              <Users size={16} className="text-info-emphasis" />
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <div className="fw-medium text-info-emphasis text-truncate">
                                {student.name}
                              </div>
                              <small className="text-muted text-truncate d-block">
                                {student.email}
                              </small>
                              <small className="text-muted">
                                {new Date(student.createdAt).toLocaleDateString()}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {unmappedStudents.length > 4 && (
                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                      <div className="card border-info border-opacity-50 bg-info bg-opacity-10">
                        <div className="card-body p-3 d-flex align-items-center justify-content-center">
                          <div className="text-center">
                            <div className="fw-bold text-info-emphasis">
                              +{unmappedStudents.length - 4}
                            </div>
                            <small className="text-muted">more students</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Summary */}
      {totalNotifications > 0 && (
        <div className="mt-4 p-3 bg-light rounded">
          <h6 className="fw-semibold mb-2">Quick Actions Summary</h6>
          <div className="d-flex flex-wrap gap-2">
            {pendingActions.filter(a => a.type === 'unmap_students').length > 0 && (
              <span className="badge bg-warning d-flex align-items-center">
                <MessageSquare size={14} className="me-1" />
                <span className="d-none d-sm-inline">
                  {pendingActions.filter(a => a.type === 'unmap_students').length} Role Change{pendingActions.filter(a => a.type === 'unmap_students').length > 1 ? 's' : ''}
                </span>
                <span className="d-sm-none">{pendingActions.filter(a => a.type === 'unmap_students').length} Role</span>
              </span>
            )}
            {pendingActions.filter(a => a.type === 'no_mentor_alert').length > 0 && (
              <span className="badge bg-danger d-flex align-items-center">
                <AlertTriangle size={14} className="me-1" />
                <span className="d-none d-sm-inline">
                  {pendingActions.filter(a => a.type === 'no_mentor_alert').length} No Mentor Alert{pendingActions.filter(a => a.type === 'no_mentor_alert').length > 1 ? 's' : ''}
                </span>
                <span className="d-sm-none">{pendingActions.filter(a => a.type === 'no_mentor_alert').length} No Mentor</span>
              </span>
            )}
            {pendingActions.filter(a => a.type === 'new_user_role_requests').length > 0 && (
              <span className="badge bg-info d-flex align-items-center">
                <Users size={14} className="me-1" />
                <span className="d-none d-sm-inline">
                  {pendingActions.filter(a => a.type === 'new_user_role_requests').length} New User Request{pendingActions.filter(a => a.type === 'new_user_role_requests').length > 1 ? 's' : ''}
                </span>
                <span className="d-sm-none">{pendingActions.filter(a => a.type === 'new_user_role_requests').length} New Users</span>
              </span>
            )}
            {pendingActions.filter(a => a.type === 'role_request').length > 0 && (
              <span className="badge bg-primary d-flex align-items-center">
                <MessageSquare size={14} className="me-1" />
                <span className="d-none d-sm-inline">
                  {pendingActions.filter(a => a.type === 'role_request').length} Role Request{pendingActions.filter(a => a.type === 'role_request').length > 1 ? 's' : ''}
                </span>
                <span className="d-sm-none">{pendingActions.filter(a => a.type === 'role_request').length} Roles</span>
              </span>
            )}
            {unmappedStudents.length > 0 && (
              <span className="badge bg-secondary d-flex align-items-center">
                <Clock size={14} className="me-1" />
                <span className="d-none d-sm-inline">
                  {unmappedStudents.length} Unmapped Student{unmappedStudents.length > 1 ? 's' : ''}
                </span>
                <span className="d-sm-none">{unmappedStudents.length} Unmapped</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeActions;
