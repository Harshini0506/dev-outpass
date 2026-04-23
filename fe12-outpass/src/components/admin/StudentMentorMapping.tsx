import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Users, Search, UserPlus, UserMinus, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface StudentMentorMapping {
  id: string;
  studentId: string;
  mentorId: string;
  student: User;
  mentor: User;
}

interface MappingData {
  mappings: StudentMentorMapping[];
  studentsWithoutMentors: User[];
  allMentors: User[];
  summary: {
    totalMappings: number;
    unmappedStudents: number;
    totalMentors: number;
  };
}

interface StudentMentorMappingProps {
  onRoleChange?: () => void;
}

const StudentMentorMapping: React.FC<StudentMentorMappingProps> = ({ onRoleChange }) => {
  const [mappings, setMappings] = useState<StudentMentorMapping[]>([]);
  const [unmappedStudents, setUnmappedStudents] = useState<User[]>([]);
  const [allMentors, setAllMentors] = useState<User[]>([]);
  const [selectedStudentMappings, setSelectedStudentMappings] = useState<{ [studentId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    totalMappings: 0,
    unmappedStudents: 0,
    totalMentors: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [unmappedCurrentPage, setUnmappedCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch student-mentor mappings from the correct admin endpoint
      const response = await api.get<MappingData>('/admin/student-mentor-mappings');
      const { mappings, studentsWithoutMentors, allMentors, summary } = response.data;
      
      setMappings(mappings);
      setUnmappedStudents(studentsWithoutMentors);
      setAllMentors(allMentors);
      setSummary(summary);
      
      // Build current mapping state for students
      const currentMappings: { [studentId: string]: string } = {};
      mappings.forEach((mapping) => {
        currentMappings[mapping.studentId] = mapping.mentorId;
      });
      setSelectedStudentMappings(currentMappings);
      
    } catch (error) {
      console.error('Failed to fetch student-mentor mappings:', error);
      toast.error('Failed to load student-mentor mappings');
    } finally {
      setLoading(false);
    }
  };

  const updateStudentMentorMapping = async (studentId: string, mentorId: string | null) => {
    try {
      const payload = mentorId ? { mentorId } : {};
      
      await api.put(`/admin/student-mentor-mappings/${studentId}`, payload);
      
      // Update local state
      if (mentorId) {
        setSelectedStudentMappings(prev => ({
          ...prev,
          [studentId]: mentorId
        }));
        toast.success('Mentor assigned successfully');
      } else {
        setSelectedStudentMappings(prev => {
          const updated = { ...prev };
          delete updated[studentId];
          return updated;
        });
        toast.success('Mentor assignment removed');
      }
      
      // Refresh data to keep everything in sync
      await fetchData();
      
      if (onRoleChange) {
        onRoleChange();
      }
    } catch (error) {
      console.error('Failed to update student-mentor mapping:', error);
      toast.error('Failed to update mapping');
    }
  };

  const handleMentorChange = (studentId: string, mentorId: string) => {
    if (mentorId === '') {
      updateStudentMentorMapping(studentId, null);
    } else {
      updateStudentMentorMapping(studentId, mentorId);
    }
  };

  // Filter data based on search term
  const filteredMappings = mappings.filter(mapping =>
    mapping.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.mentor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUnmappedStudents = unmappedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalMappings = filteredMappings.length;
  const totalMappingPages = Math.ceil(totalMappings / itemsPerPage);
  const startMappingIndex = (currentPage - 1) * itemsPerPage;
  const endMappingIndex = startMappingIndex + itemsPerPage;
  const paginatedMappings = filteredMappings.slice(startMappingIndex, endMappingIndex);

  const totalUnmapped = filteredUnmappedStudents.length;
  const totalUnmappedPages = Math.ceil(totalUnmapped / itemsPerPage);
  const startUnmappedIndex = (unmappedCurrentPage - 1) * itemsPerPage;
  const endUnmappedIndex = startUnmappedIndex + itemsPerPage;
  const paginatedUnmappedStudents = filteredUnmappedStudents.slice(startUnmappedIndex, endUnmappedIndex);

  // Pagination component
  const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
  }> = ({ currentPage, totalPages, onPageChange, className = '' }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + maxVisiblePages - 1);
        
        if (start > 1) {
          pages.push(1);
          if (start > 2) pages.push('...');
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        if (end < totalPages) {
          if (end < totalPages - 1) pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <nav className={`d-flex justify-content-center ${className}`}>
        <ul className="pagination pagination-sm">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
          </li>
          
          {getPageNumbers().map((page, index) => (
            <li
              key={index}
              className={`page-item ${typeof page === 'number' && page === currentPage ? 'active' : ''} ${typeof page === 'string' ? 'disabled' : ''}`}
            >
              {typeof page === 'number' ? (
                <button
                  className="page-link"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              ) : (
                <span className="page-link">{page}</span>
              )}
            </li>
          ))}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading student-mentor mappings...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-primary">
            <div className="card-body text-center">
              <Users className="h2 text-primary mb-2" />
              <h4 className="card-title">{summary.totalMappings}</h4>
              <p className="card-text text-muted">Total Mappings</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <AlertTriangle className="h2 text-warning mb-2" />
              <h4 className="card-title">{summary.unmappedStudents}</h4>
              <p className="card-text text-muted">Unmapped Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <UserPlus className="h2 text-success mb-2" />
              <h4 className="card-title">{summary.totalMentors}</h4>
              <p className="card-text text-muted">Available Mentors</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body text-center">
              <Users className="h2 text-info mb-2" />
              <h4 className="card-title">{summary.totalMappings + summary.unmappedStudents}</h4>
              <p className="card-text text-muted">Total Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search students, mentors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Unmapped Students Section */}
      {filteredUnmappedStudents.length > 0 && (
        <div className="card mb-4 border-warning">
          <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <AlertTriangle size={20} className="me-2" />
              Students Without Mentors ({totalUnmapped})
            </h5>
            {totalUnmappedPages > 1 && (
              <small className="text-dark">
                Showing {startUnmappedIndex + 1}-{Math.min(endUnmappedIndex, totalUnmapped)} of {totalUnmapped}
              </small>
            )}
          </div>
          <div className="card-body">
            <div className="row">
              {paginatedUnmappedStudents.map((student) => (
                <div key={student.id} className="col-md-6 mb-3">
                  <div className="card border-warning">
                    <div className="card-body">
                      <h6 className="card-title">{student.name}</h6>
                      <p className="card-text text-muted">{student.email}</p>
                      <div className="d-flex gap-2">
                        <select
                          className="form-select form-select-sm"
                          value={selectedStudentMappings[student.id] || ''}
                          onChange={(e) => handleMentorChange(student.id, e.target.value)}
                        >
                          <option value="">Select Mentor</option>
                          {allMentors.map((mentor) => (
                            <option key={mentor.id} value={mentor.id}>
                              {mentor.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Unmapped Students Pagination */}
            <Pagination
              currentPage={unmappedCurrentPage}
              totalPages={totalUnmappedPages}
              onPageChange={setUnmappedCurrentPage}
              className="mt-3"
            />
          </div>
        </div>
      )}

      {/* Current Mappings Section */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <Users size={20} className="me-2" />
            Current Student-Mentor Mappings ({totalMappings}{totalMappings !== filteredMappings.length ? ` of ${filteredMappings.length} filtered` : ''})
          </h5>
          {totalMappingPages > 1 && (
            <small className="text-muted">
              Showing {startMappingIndex + 1}-{Math.min(endMappingIndex, totalMappings)} of {totalMappings}
            </small>
          )}
        </div>
        <div className="card-body">
          {filteredMappings.length === 0 ? (
            <div className="text-center py-4">
              <Users size={48} className="text-muted mb-3" />
              <p className="text-muted">No student-mentor mappings found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Student</th>
                      <th>Student Email</th>
                      <th>Current Mentor</th>
                      <th>Mentor Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMappings.map((mapping) => (
                      <tr key={mapping.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-2" 
                                 style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                              {mapping.student.name.charAt(0).toUpperCase()}
                            </div>
                            <strong>{mapping.student.name}</strong>
                          </div>
                        </td>
                        <td className="text-muted">{mapping.student.email}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-success rounded-circle text-white d-flex align-items-center justify-content-center me-2" 
                                 style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                              {mapping.mentor.name.charAt(0).toUpperCase()}
                            </div>
                            {mapping.mentor.name}
                          </div>
                        </td>
                        <td className="text-muted">{mapping.mentor.email}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <select
                              className="form-select form-select-sm"
                              value={mapping.mentorId}
                              onChange={(e) => handleMentorChange(mapping.studentId, e.target.value)}
                            >
                              <option value="">No Mentor</option>
                              {allMentors.map((mentor) => (
                                <option key={mentor.id} value={mentor.id}>
                                  {mentor.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleMentorChange(mapping.studentId, '')}
                              title="Remove mentor assignment"
                            >
                              <UserMinus size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Current Mappings Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalMappingPages}
                onPageChange={setCurrentPage}
                className="mt-3"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMentorMapping;
 