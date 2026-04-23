import { customAlphabet } from 'nanoid';
import QRCode from 'qrcode';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

export async function generateQRCode(passId: string, token: string): Promise<string> {
  const scanUrl = `${process.env.PUBLIC_BASE_URL}/security/scan/${passId}/${token}`;
  return QRCode.toDataURL(scanUrl);
}

export function generateToken(): string {
  return nanoid();
}
