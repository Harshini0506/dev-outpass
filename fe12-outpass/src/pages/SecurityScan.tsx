import React from 'react';
import { useZxing } from 'react-zxing';
import { useQrScanner } from '../hooks/useQrScanner'; // Import our new hook

const SecurityScan: React.FC = () => {
  const { data, error, isLoading, processScan, reset } = useQrScanner();

  // The useZxing hook handles all the camera logic
  const { ref } = useZxing({
    // We only process a scan if we aren't already loading, and don't have data or an error
    onDecodeResult: (result) => {
      if (!isLoading && !data && !error) {
        processScan(result.getText());
      }
    },
    // Declaratively pause the scanner when we have a result or an error
    paused: !!data || !!error || isLoading,
  });

  const handleManualEntry = () => {
    const qrUrl = prompt('Enter QR code URL manually:');
    if (qrUrl && qrUrl.trim()) {
      processScan(qrUrl.trim());
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="text-center mb-4">
            <h3 className="text-primary fw-bold">🔒 Security QR Scanner</h3>
            <p className="text-muted">Scan gate pass QR codes for validation</p>
          </div>

          {/* === Main Content Area === */}
          <div className="card shadow-sm">
            {/* Success State */}
            {data && <SuccessDisplay result={data} onScanAnother={reset} />}

            {/* Error State */}
            {error && <ErrorDisplay error={error} onTryAgain={reset} onManualEntry={handleManualEntry} />}

            {/* Loading State */}
            {isLoading && <LoadingDisplay />}

            {/* Scanner View (Default State) */}
            {!data && !error && !isLoading && (
              <div className="card-body p-2">
                <video ref={ref} style={{ width: '100%', minHeight: '300px' }} />
                <div className="text-center mt-2">
                  <small className="text-success">
                    <div className="spinner-grow spinner-grow-sm text-success me-2" role="status"></div>
                    🔍 Point camera at QR code
                  </small>
                </div>
                <div className="text-center mt-3">
                  <button className="btn btn-sm btn-outline-secondary" onClick={handleManualEntry}>
                    ⌨️ Enter QR URL Manually
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-4">
            <small className="text-muted">
              💡 <strong>Tips:</strong> Hold device steady • Ensure good lighting
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components for cleaner rendering ---

const LoadingDisplay = () => (
  <div className="card-body text-center p-5">
    <div className="spinner-border text-primary" role="status"></div>
    <h5 className="mt-3">Validating QR Code...</h5>
  </div>
);

const ErrorDisplay = ({ error, onTryAgain, onManualEntry }: { 
  error: string; 
  onTryAgain: () => void; 
  onManualEntry: () => void; 
}) => (
  <div className="card-body text-center p-4">
    <h4 className="alert-heading text-danger">❌ Access Denied</h4>
    <p className="mb-3">{error}</p>
    <div className="d-flex gap-2 justify-content-center">
      <button className="btn btn-danger" onClick={onTryAgain}>
        🔄 Try Again
      </button>
      <button className="btn btn-outline-primary" onClick={onManualEntry}>
        ⌨️ Manual Entry
      </button>
    </div>
  </div>
);

const SuccessDisplay = ({ result, onScanAnother }: { result: any; onScanAnother: () => void }) => (
  <>
    <div className="card-header bg-success text-white text-center">
      <h5 className="mb-0">✅ Access Granted</h5>
    </div>
    <div className="card-body">
      <div className="text-center mb-3">
        <h5 className="fw-bold text-primary">{result.student.name}</h5>
        <span className="text-muted">{result.student.email}</span>
      </div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item d-flex justify-content-between">
          <strong>Reason:</strong>
          <span>{result.reason}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <strong>Applied:</strong>
          <span>{new Date(result.appliedAt).toLocaleString()}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <strong>Scanned:</strong>
          <span>{new Date(result.scannedAt).toLocaleString()}</span>
        </li>
      </ul>
      <div className="text-center mt-4">
        <button className="btn btn-outline-primary" onClick={onScanAnother}>
          🔄 Scan Another Code
        </button>
      </div>
    </div>
  </>
);

export default SecurityScan;