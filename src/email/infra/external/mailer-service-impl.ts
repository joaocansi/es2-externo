import { MailerService as NodemailerService } from '@nestjs-modules/mailer';
import { AppError, AppErrorType } from 'src/common/domain/app-error';
import Email from 'src/email/domain/email';
import { MailerService } from 'src/email/domain/mailer-service';

export class MailerServiceImpl implements MailerService {
  private emails: Email[];

  constructor(private readonly nodemailer: NodemailerService) {
    this.emails = [];
  }

  async sendEmail(to: string, subject: string, body: string): Promise<Email> {
    try {
      await this.nodemailer.sendMail({
        to,
        subject,
        text: body,
      });

      const email = new Email();
      email.id = this.emails.length + 1;
      email.email = to;
      email.assunto = subject;
      email.mensagem = body;
      this.emails.push(email);

      return email;
    } catch (error) {
      console.log(error);
      throw new AppError(
        'Não foi possível enviar e-email',
        AppErrorType.EXTERNAL_SERVICE_ERROR,
      );
    }
  }
}
