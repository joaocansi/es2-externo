import { Inject } from '@nestjs/common';
import { MailerService } from './domain/mailer-service';
import { SendEmailDto } from './dto/send-email.dto';

export class EmailService {
  constructor(
    @Inject('MailerService') private readonly mailerService: MailerService,
  ) {}

  async sendEmail(sendEmailDto: SendEmailDto) {
    const { email, assunto, mensagem } = sendEmailDto;
    return this.mailerService.sendEmail(email, assunto, mensagem);
  }
}
