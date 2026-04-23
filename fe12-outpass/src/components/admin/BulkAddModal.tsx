import React, { useState } from 'react';
import { toast } from 'sonner';
import { Upload, Users, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Trash2, Calendar, FileText, Clock } from 'lucide-react';
import { api } from '../../api';

interface BulkAddModalProps {
  show: boolean;
  onHide: () => void;
  onUsersAdded: () => void;
}

interface ProcessingResult {
  success: boolean;
  studentsCreated: number;
  studentsUpdated: number;
  mentorsCreated: number;
  mappingsCreated: number;
  errors: string[];
  warnings?: string[];
  studentsWithoutMentors?: Array<{ rollNumber: string; name: string; email: string }>;
  detectedColumns?: Record<string, string>;
  details?: {
    students: Array<{ rollNumber: string; email: string; status: 'created' | 'updated' | 'error' }>;
    mentors: Array<{ email: string; name: string; status: 'created' | 'existing' }>;
    mappings: Array<{ studentEmail: string; mentorEmail: string; status: 'created' | 'error' }>;
  };
}

const BulkAddModal: React.FC<BulkAddModalProps> = ({ show, onHide, onUsersAdded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [undoLoading, setUndoLoading] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [recentImports, setRecentImports] = useState<any[]>([]);
  const [importsLoading, setImportsLoading] = useState(false);

  // Fetch recent imports when modal opens
  React.useEffect(() => {
    if (show) {
      fetchRecentImports();
    }
  }, [show]);

  const fetchRecentImports = async () => {
    setImportsLoading(true);
    try {
      const response = await api.get('/admin/bulk-imports');
      if (response.data.success) {
        setRecentImports(response.data.imports || []);
      }
    } catch (error) {
      console.error('Error fetching bulk imports:', error);
    } finally {
      setImportsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.toLowerCase().endsWith('.xlsx') && 
          !selectedFile.name.toLowerCase().endsWith('.xls')) {
        toast.error('Invalid File Type', {
          description: 'Please upload an Excel file (.xlsx or .xls)'
        });
        return;
      }
      setFile(selectedFile);
      setResult(null); // Clear previous results
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('No File Selected', {
        description: 'Please select an Excel file to upload.'
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      toast.loading('Processing Excel file...', {
        description: 'Creating students, mentors, and mappings. This may take a few moments.'
      });

      const response = await api.post('/admin/bulk-add-users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.dismiss();
      
      if (response.data.success) {
        setResult(response.data);
        
        // Show different toast based on whether there are warnings
        if (response.data.studentsWithoutMentors?.length > 0) {
          toast.warning('Upload Completed with Warnings', {
            description: `${response.data.studentsCreated} students processed. ${response.data.studentsWithoutMentors.length} students need mentor assignment.`
          });
        } else {
          toast.success('Bulk Upload Completed!', {
            description: `${response.data.studentsCreated} students and ${response.data.mentorsCreated} mentors added successfully.`
          });
        }
        
        onUsersAdded();
      } else {
        setResult(response.data);
        toast.error('Upload Failed', {
          description: 'Failed to process the Excel file. Please check the format and try again.'
        });
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error('Upload Failed', {
        description: error.response?.data?.message || 'Failed to process Excel file. Please try again.'
      });
      
      // Show detailed errors if available
      if (error.response?.data?.errors) {
        setResult({
          success: false,
          studentsCreated: 0,
          studentsUpdated: 0,
          mentorsCreated: 0,
          mappingsCreated: 0,
          errors: error.response.data.errors,
          warnings: [],
          studentsWithoutMentors: [],
          detectedColumns: error.response.data.detectedColumns,
          details: { students: [], mentors: [], mappings: [] }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!window.confirm('Are you sure you want to undo recent bulk imports? This will only remove users created via bulk upload, not your existing users.')) {
      return;
    }

    setUndoLoading(true);
    try {
      const response = await api.post('/admin/undo-bulk-imports');
      
      if (response.data.success) {
        toast.success('Bulk Import Undone', {
          description: `Removed ${response.data.usersRemoved || 0} recently imported users.`
        });
        
        setResult(null);
        resetForm();
        fetchRecentImports();
        onUsersAdded(); // Refresh the user list
      } else {
        toast.error('Undo Failed', {
          description: response.data.error || 'Failed to undo bulk imports'
        });
      }
    } catch (error: any) {
      console.error('Error undoing bulk imports:', error);
      toast.error('Undo Failed', {
        description: error.response?.data?.error || 'Failed to undo bulk imports'
      });
    } finally {
      setUndoLoading(false);
    }
  };

  const handleDeleteImport = async (importId: string, filename: string) => {
    if (!window.confirm(`Are you sure you want to delete all users added from "${filename}"? This action cannot be undone.`)) {
      return;
    }

    toast.loading(`Deleting users from ${filename}...`);
    try {
      const response = await api.delete(`/admin/bulk-imports/${importId}`);
      
      if (response.data.success) {
        toast.dismiss();
        toast.success('Import Deleted', {
          description: `Successfully removed ${response.data.removedCount} users from ${filename}.`
        });
        
        fetchRecentImports();
        onUsersAdded();
      } else {
        toast.dismiss();
        toast.error('Deletion Failed', {
          description: response.data.error || 'Failed to delete import'
        });
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('Error deleting specific import:', error);
      toast.error('Deletion Failed', {
        description: error.response?.data?.error || 'Failed to delete import'
      });
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    const fileInput = document.getElementById('bulkUploadFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title d-flex align-items-center">
              <Users className="me-2" size={20} />
              Bulk Add Students & Mentors
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>
          
          <div className="modal-body p-4">
            {/* Instructions */}
            <div className="alert alert-info d-flex align-items-start mb-4">
              <FileSpreadsheet className="me-2 mt-1" size={20} />
              <div>
                <p className="mb-2">Upload your Excel file with student and mentor data.</p>

                <div className="mt-2">
                  <small className="text-muted">
                    <strong>Note:</strong> Student emails are auto-generated from roll numbers (e.g., 24071A3201 → 24071a3201@vnrvjiet.in)
                  </small>
                </div>
              </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-medium">
                  <Upload size={16} className="me-1" />
                  Select Excel File
                </label>
                <input
                  type="file"
                  id="bulkUploadFile"
                  className="form-control"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {file && (
                  <div className="mt-2 text-success small d-flex align-items-center">
                    <CheckCircle size={16} className="me-1" />
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2 mb-4">
                <button
                  type="submit"
                  className="btn btn-success flex-grow-1"
                  disabled={!file || loading || undoLoading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="me-1" />
                      Upload & Process
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                  disabled={loading || undoLoading}
                >
                  Clear
                </button>
                {/* Global undo button */}
                <button
                  type="button"
                  className="btn btn-outline-warning"
                  onClick={handleUndo}
                  disabled={loading || undoLoading || importsLoading}
                  title="Remove recently bulk-imported users (preserves existing users)"
                >
                  {undoLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Undoing...
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="me-1" />
                      Undo Recent Imports
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* History of Imports */}
            <div className="mt-4 border-top pt-4">
              <h6 className="mb-3 d-flex align-items-center text-muted">
                <Clock size={16} className="me-2" />
                Recent Bulk Upload History
              </h6>
              
              {importsLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                </div>
              ) : recentImports.length > 0 ? (
                <div className="list-group list-group-flush border rounded shadow-sm overflow-auto" style={{ maxHeight: '300px' }}>
                  {recentImports.map((imp) => {
                    let userCount = 0;
                    try { userCount = JSON.parse(imp.userIds || '[]').length; } catch(e) {}
                    
                    return (
                      <div key={imp.id} className="list-group-item d-flex justify-content-between align-items-center p-3 hover-bg-light">
                        <div className="d-flex align-items-center">
                          <div className="bg-light p-2 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <FileText size={20} className="text-secondary" />
                          </div>
                          <div>
                            <div className="fw-semibold text-dark truncate-text" style={{ maxWidth: '300px' }}>{imp.filename}</div>
                            <div className="small text-muted d-flex align-items-center">
                              <Calendar size={12} className="me-1" />
                              {new Date(imp.createdAt).toLocaleDateString()} 
                              <span className="mx-2">•</span>
                              <Clock size={12} className="me-1" />
                              {new Date(imp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              <span className="mx-2">•</span>
                              <Users size={12} className="me-1" />
                              {userCount} users
                            </div>
                          </div>
                        </div>
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline-danger d-flex align-items-center px-3"
                          onClick={() => handleDeleteImport(imp.id, imp.filename)}
                          title="Delete this specific import and its users"
                          disabled={loading || undoLoading}
                        >
                          <Trash2 size={14} className="me-1" />
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted bg-light rounded border border-dashed">
                  <AlertCircle size={24} className="mb-2 opacity-50" />
                  <div>No bulk import history found.</div>
                </div>
              )}
            </div>

            {/* Results Display */}
            {result && (
              <div className="mt-4">
                <hr />
                <h6 className="mb-3">Processing Results</h6>
                
                {result.success ? (
                  <div className="alert alert-success">
                    <div className="d-flex align-items-center mb-2">
                      <CheckCircle className="me-2" size={20} />
                      <strong>Upload Successful!</strong>
                    </div>
                    <div className="row small">
                      <div className="col-md-6">
                        <ul className="mb-0">
                          <li>Students Created: <strong>{result.studentsCreated}</strong></li>
                          <li>Students Updated: <strong>{result.studentsUpdated}</strong></li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="mb-0">
                          <li>Mentors Created: <strong>{result.mentorsCreated}</strong></li>
                          <li>Student-Mentor Mappings: <strong>{result.mappingsCreated}</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-danger">
                    <div className="d-flex align-items-center mb-2">
                      <XCircle className="me-2" size={20} />
                      <strong>Upload Failed</strong>
                    </div>
                  </div>
                )}

                {/* Warning for students without mentors */}
                {result.studentsWithoutMentors && result.studentsWithoutMentors.length > 0 && (
                  <div className="alert alert-warning">
                    <div className="d-flex align-items-center mb-2">
                      <AlertCircle className="me-2" size={20} />
                      <strong>Students Without Mentor Assignment ({result.studentsWithoutMentors.length})</strong>
                    </div>
                    <p className="mb-2 small">The following students were created but need mentor assignment:</p>
                    <div className="table-responsive">
                      <table className="table table-sm table-striped mb-0">
                        <thead>
                          <tr>
                            <th>Roll Number</th>
                            <th>Name</th>
                            <th>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.studentsWithoutMentors.map((student, index) => (
                            <tr key={index}>
                              <td><strong>{student.rollNumber}</strong></td>
                              <td>{student.name}</td>
                              <td><small className="text-muted">{student.email}</small></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        💡 <strong>Action Required:</strong> Please assign mentors to these students through the User Management section.
                      </small>
                    </div>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="alert alert-warning">
                    <div className="d-flex align-items-center mb-2">
                      <AlertCircle className="me-2" size={20} />
                      <strong>Issues Found:</strong>
                    </div>
                    <ul className="mb-0 small">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer bg-light">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              {result?.success ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkAddModal;