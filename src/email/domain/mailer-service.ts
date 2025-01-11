import Email from './email';

export interface MailerService {
  sendEmail(to: string, subject: string, body: string): Promise<Email>;
  deleteAll(): Promise<void>;
}
