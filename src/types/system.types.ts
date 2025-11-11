export interface SystemSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderDaysBefore: number;
  autoApprovalEnabled: boolean;
  requireOcrVerification: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  twilio: {
    accountSid?: string;
    authToken?: string;
    fromNumber?: string;
  };
  email: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail?: string;
  };
}
