import { MailerService as NodemailerService } from '@nestjs-modules/mailer';
import { BadRequestException } from '@nestjs/common';
import Email from 'src/email/domain/email';
import { MailerService } from 'src/email/domain/mailer-service';

export class MailerServiceImpl implements MailerService {
  private emails: Email[];

  constructor(private readonly nodemailer: NodemailerService) {
    this.emails = [];
  }

  deleteAll(): Promise<void> {
    return new Promise((resolve) => {
      this.emails = [];
      resolve();
    });
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
    } catch {
      throw new BadRequestException('Não foi possível enviar e-email');
    }
  }
}
