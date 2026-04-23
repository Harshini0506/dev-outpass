import React, { useEffect } from 'react';
import { toast } from 'sonner';

// Placeholder for HOD review panel
const HodPanel: React.FC = () => {
  useEffect(() => {
    toast.info('HOD Panel', {
      description: 'This panel is under development. Advanced features will be available soon.'
    });
  }, []);

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0 fade-in">
            <div className="card-body p-5 text-center">
              <h2 className="fw-bold text-dark mb-3">HOD Review Panel</h2>
              <p className="text-muted mb-4">
                Advanced gate pass management and reporting features coming soon.
              </p>
              <div className="bg-light p-4 rounded">
                <h6 className="fw-semibold mb-3">Planned Features:</h6>
                <ul className="list-unstyled text-start">
                  <li className="mb-2">📊 Department-wide gate pass analytics</li>
                  <li className="mb-2">📈 Usage reports and trends</li>
                  <li className="mb-2">👥 Student activity monitoring</li>
                  <li className="mb-2">⚙️ Policy management and settings</li>
                  <li className="mb-2">📋 Bulk approval workflows</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodPanel;
