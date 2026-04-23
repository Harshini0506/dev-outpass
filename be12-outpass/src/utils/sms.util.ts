import axios from 'axios';

interface SMSConfig {
  username: string;
  apikey: string;
  senderid: string;
  route: string;
  TID: string;
  PEID: string;
}

interface SMSData {
  mobile: string;
  text: string;
}

class SMSService {
  private config: SMSConfig;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.SMS_API_URL || '';
    this.config = {
      username: process.env.SMS_USERNAME || '',
      apikey: process.env.SMS_API_KEY || '',
      senderid: process.env.SMS_SENDER_ID || '',
      route: process.env.SMS_ROUTE || '',
      TID: process.env.SMS_TID || '',
      PEID: process.env.SMS_PEID || '',
    };
  }

  private validateConfig(): boolean {
    return Object.values(this.config).every(value => value !== '') && this.baseURL !== '';
  }

  public async sendSMS(mobile: string, text: string): Promise<boolean> {
    if (!this.validateConfig()) {
      console.error('SMS configuration is incomplete');
      return false;
    }

    try {
      const params = new URLSearchParams({
        username: this.config.username,
        apikey: this.config.apikey,
        senderid: this.config.senderid,
        route: this.config.route,
        mobile: mobile,
        text: encodeURIComponent(text),
        TID: this.config.TID,
        PEID: this.config.PEID,
      });

      console.log(`📱 [DEV MODE] Simulating SMS to ${mobile}: ${text}`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ [DEV MODE] SMS simulation successful for ${mobile}`);
        return true;
      }

      const url = `${this.baseURL}?${params.toString()}`;
      
      console.log(`📱 Sending actual SMS to ${mobile}: ${text}`);
      
      // For testing purposes, bypass SSL verification
      // In production, ensure the SMS provider has proper SSL certificates
      const response = await axios.get(url, {
        timeout: 10000, // 10 seconds timeout
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });

      if (response.status === 200) {
        console.log(`✅ SMS sent successfully to ${mobile}:`, response.data);
        return true;
      } else {
        console.error(`❌ SMS failed with status ${response.status}:`, response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ SMS sending error:', error);
      return false;
    }
  }


  /**
   * Send QR scan notification to parent using DLT-approved template
   * Template: Dear Parent, your ward {#var#}, {#var#} has been granted permission to leave college premises via Outpass for the following reason:{#var#}.-VNR Vignana Jyothi Institute of Engineering and Technology.
   * TID: 1607100000000358305
   */
  async sendQRScannedToParent(name: string, rollno: string, reason: string, mobile: string, scanTime: Date): Promise<boolean> {
    const baseUrl = 'https://textsms.adeep.in/api.php';
    
    const message = `Dear Parent, your ward ${name}, ${rollno} has been granted permission to leave college premises via Outpass for the following reason:"${reason}".-VNR Vignana Jyothi Institute of Engineering and Technology.`;

    const params = new URLSearchParams({
      username: 'VNRVJIET',
      apikey: '4GHeq5OTe8Hj',
      senderid: 'VNRVJI',
      route: 'TRANS',
      mobile: mobile,
      text: message,
      TID: '1607100000000358305', // DLT template ID for parent QR scan notification
      PEID: '1601100000000013508',
    });

    console.log(`📱 [DEV MODE] Simulating QR scan SMS to parent ${mobile}: ${message}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [DEV MODE] QR scan SMS simulation successful for ${mobile}`);
      return true;
    }

    const url = `${baseUrl}?${params.toString()}`;
    //firewall 
    console.log(`📱 Sending actual QR scan SMS to parent ${mobile}: ${message}`);

    try {
      const response = await axios.get(url, {
        timeout: 10000, // 10 seconds timeout
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });

      if (response.status === 200) {
        console.log(`✅ QR scan SMS sent successfully to parent ${mobile}:`, response.data);
        return true;
      } else {
        console.error(`❌ QR scan SMS failed with status ${response.status}:`, response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ QR scan SMS sending error:', error);
      return false;
    }
  }

  /**
   * Send notification to mentor using DLT-approved template
   * Template: Dear Mentor, your mentee {#var#}, {#var#} has applied for an Outpass with reason:{#var#}. Please review and take action by visiting the Outpass website. - VNR Vignana Jyothi Institute of Engineering and Technology.
   * TID: 1607100000000358304
   */
  async sendMentorNotification(mentorName: string, studentName: string, rollno: string, reason: string, mobile: string): Promise<boolean> {
    const baseUrl = 'https://textsms.adeep.in/api.php';
    const message = `Dear Mentor, your mentee ${studentName}, ${rollno} has applied for an Outpass with reason: "${reason}". Please review and take action by visiting the Outpass website. - VNR Vignana Jyothi Institute of Engineering and Technology.`;

    const params = new URLSearchParams({
      username: 'VNRVJIET',
      apikey: '4GHeq5OTe8Hj',
      senderid: 'VNRVJI',
      route: 'TRANS',
      mobile: mobile,
      text: message,
      TID: '1607100000000358304', // DLT template ID for mentor notification
      PEID: '1601100000000013508',
    });

    console.log(`📱 [DEV MODE] Simulating SMS to mentor ${mobile}: ${message}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [DEV MODE] SMS simulation successful for ${mobile}`);
      return true;
    }

    const url = `${baseUrl}?${params.toString()}`;
    
    console.log(`📱 Sending actual SMS to mentor ${mobile}: ${message}`);

    try {
      const response = await axios.get(url, {
        timeout: 10000, // 10 seconds timeout
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });

      if (response.status === 200) {
        console.log(`✅ SMS sent successfully to mentor ${mobile}:`, response.data);
        return true;
      } else {
        console.error(`❌ SMS failed with status ${response.status}:`, response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ SMS sending error:', error);
      return false;
    }
  }

}

export const smsService = new SMSService();
