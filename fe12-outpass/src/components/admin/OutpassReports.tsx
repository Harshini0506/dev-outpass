import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FileText, Download, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../api';
import Pagination from '../ui/Pagination';

interface OutpassEvent {
  id: string;
  outpassId: string;
  event: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    role: string;
  };
  student?: {
    name: string;
    email: string;
  };
  mentor?: {
    name: string;
  };
}

interface OutpassReportsProps {
  onDownloadReport?: () => void;
}

const OutpassReports: React.FC<OutpassReportsProps> = () => {
  const [events, setEvents] = useState<OutpassEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEventLogs();
  }, [dateRange]);

  const fetchEventLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/outpass-reports', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          limit: 100
        }
      });
      
      // Transform outpass data into event format for the timeline
      const outpasses = response.data.outpasses || [];
      const transformedEvents: OutpassEvent[] = outpasses.map((outpass: any) => ({
        id: outpass.id,
        outpassId: outpass.id,
        event: outpass.status.toLowerCase(),
        description: `Outpass ${outpass.status.toLowerCase()} - ${outpass.reason}`,
        timestamp: outpass.appliedAt,
        student: {
          id: outpass.student.id,
          name: outpass.student.name,
          email: outpass.student.email
        },
        mentor: outpass.mentor ? {
          id: outpass.mentor.id,
          name: outpass.mentor.name,
          email: outpass.mentor.email
        } : undefined,
        details: {
          reason: outpass.reason,
          from: outpass.from,
          to: outpass.to,
          duration: outpass.duration,
          status: outpass.status
        }
      }));
      
      setEvents(transformedEvents);
    } catch (error) {
      toast.error('Failed to Load Event Logs', {
        description: 'Unable to fetch outpass event logs.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (event: string) => {
    switch (event.toLowerCase()) {
      case 'created':
      case 'applied':
        return <FileText size={16} className="text-primary" />;
      case 'approved':
        return <CheckCircle size={16} className="text-success" />;
      case 'rejected':
        return <XCircle size={16} className="text-danger" />;
      case 'escalated':
        return <AlertCircle size={16} className="text-warning" />;
      case 'utilized':
        return <CheckCircle size={16} className="text-info" />;
      default:
        return <Clock size={16} className="text-muted" />;
    }
  };

  const getEventColor = (event: string) => {
    switch (event.toLowerCase()) {
      case 'created':
      case 'applied':
        return 'primary';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'escalated':
        return 'warning';
      case 'utilized':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportEventLogs = async () => {
    try {
      toast.loading('Preparing event logs export...');
      const response = await api.post('/admin/export-event-logs', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format: 'excel'
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `outpass-event-logs-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Event Logs Exported', {
        description: 'Event logs have been successfully exported.'
      });
    } catch (error) {
      toast.dismiss();
      toast.error('Export Failed', {
        description: 'Unable to export event logs. Please try again.'
      });
    }
  };

  const exportApprovedScannedReport = async () => {
    try {
      toast.loading('Preparing scanned passes report...');
      const response = await api.post('/admin/download-approved-scanned-report', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scanned-outpasses-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Scanned Passes Report Exported', {
        description: 'Report with scanned outpasses has been successfully exported.'
      });
    } catch (error) {
      toast.dismiss();
      toast.error('Export Failed', {
        description: 'Unable to export scanned passes report. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading event logs...</p>
      </div>
    );
  }

  return (
    <div className="outpass-reports">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <FileText className="text-primary me-3" style={{width: '1.75rem', height: '1.75rem'}} />
          <div>
            <h3 className="fw-bold mb-1 text-primary">Outpass Event Logs</h3>
            <p className="text-muted mb-0">Complete audit trail of all outpass activities</p>
          </div>
        </div>
        
        <div className="d-flex gap-3 align-items-end">
          <div className="d-flex gap-2">
            <div>
              <label className="form-label small mb-1">From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="form-label small mb-1">To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <button
              onClick={exportEventLogs}
              className="btn btn-outline-primary btn-sm d-flex align-items-center"
              title="Export all outpass records (all statuses: pending, approved, rejected, utilized)"
            >
              <Download size={16} className="me-1" />
              Export All
            </button>
            <button
              onClick={exportApprovedScannedReport}
              className="btn btn-success btn-sm d-flex align-items-center"
              title="Export only scanned passes (students who returned to campus)"
            >
              <Download size={16} className="me-1" />
              Scanned Passes
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-primary-subtle">
            <div className="card-body text-center">
              <div className="h4 fw-bold text-primary">{events.length}</div>
              <div className="small text-muted">Total Events</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-success-subtle">
            <div className="card-body text-center">
              <div className="h4 fw-bold text-success">
                {events.filter(e => e.event.toLowerCase() === 'approved').length}
              </div>
              <div className="small text-muted">Approvals</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-danger-subtle">
            <div className="card-body text-center">
              <div className="h4 fw-bold text-danger">
                {events.filter(e => e.event.toLowerCase() === 'rejected').length}
              </div>
              <div className="small text-muted">Rejections</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-info-subtle">
            <div className="card-body text-center">
              <div className="h4 fw-bold text-info">
                {events.filter(e => e.event.toLowerCase() === 'utilized').length}
              </div>
              <div className="small text-muted">Utilized</div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0">Event Timeline</h5>
        </div>
        <div className="card-body p-0">
          {events.length === 0 ? (
            <div className="text-center py-5">
              <FileText size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No Events Found</h5>
              <p className="text-muted">No outpass events found for the selected date range.</p>
            </div>
          ) : (
            (() => {
              // Calculate pagination values once
              const totalPages = Math.ceil(events.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const currentEvents = events.slice(startIndex, endIndex);

              return (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Timestamp</th>
                          <th>Event</th>
                          <th>Outpass ID</th>
                          <th>Student</th>
                          <th>Actor</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentEvents.map((event) => (
                        <tr key={event.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <Clock size={14} className="text-muted me-2" />
                              <small>{formatTimestamp(event.timestamp)}</small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {getEventIcon(event.event)}
                              <span className={`badge bg-${getEventColor(event.event)}-subtle text-${getEventColor(event.event)} ms-2`}>
                                {event.event}
                              </span>
                            </div>
                          </td>
                          <td>
                            <code className="small">{event.outpassId}</code>
                          </td>
                          <td>
                            {event.student && (
                              <div>
                                <div className="fw-medium small">{event.student.name}</div>
                                <small className="text-muted">{event.student.email}</small>
                              </div>
                            )}
                          </td>
                          <td>
                            {event.user && (
                              <div>
                                <div className="fw-medium small">{event.user.name}</div>
                                <small className={`badge bg-secondary-subtle text-secondary`}>
                                  {event.user.role}
                                </small>
                              </div>
                            )}
                          </td>
                          <td>
                            <small className="text-muted">{event.description}</small>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 px-3">
                      <small className="text-muted mb-2 mb-md-0">
                        Showing {startIndex + 1}-{Math.min(endIndex, events.length)} of {events.length} events
                      </small>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        className="mt-2 mt-md-0"
                      />
                    </div>
                  )}
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default OutpassReports;
