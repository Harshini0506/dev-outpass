import { useState } from 'react';
import { api } from '../api'; // Your existing api instance
import { toast } from 'sonner';

// Define the shape of the successful scan data
interface ScanResult {
  student: {
    name: string;
    email: string;
  };
  reason: string;
  appliedAt: string;
  scannedAt: string;
}

export const useQrScanner = () => {
  const [data, setData] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Processes a scanned QR code URL.
   */
  const processScan = async (url: string) => {
    // Prevent multiple requests while one is in flight
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    toast.loading('Validating QR code...');

    try {
      // 1. Parse the URL to get passId and token
      const parts = new URL(url).pathname.split('/');
      const passId = parts[parts.length - 2];
      const token = parts[parts.length - 1];

      if (!passId || !token) {
        throw new Error("Invalid QR code format.");
      }

      // 2. Make the API call
      const res = await api.get<ScanResult>(`/security/scan/${passId}/${token}`);
      
      setData(res.data);
      toast.dismiss();
      toast.success('Access Granted!', {
        description: `Gate pass validated for ${res.data.student.name}`,
      });

    } catch (e: any) {
      const errorMsg = e.response?.data?.message || e.message || 'Invalid or expired QR code';
      setError(errorMsg);
      toast.dismiss();
      toast.error('Access Denied', { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resets the scanner state to allow for a new scan.
   */
  const reset = () => {
    setData(null);
    setError(null);
    setIsLoading(false);
  };

  return { data, error, isLoading, processScan, reset };
};