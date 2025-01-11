import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from './domain/mailer-service';
import { SendEmailDto } from './dto/send-email.dto';
import Email from './domain/email';

describe('EmailService', () => {
  let emailService: EmailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: 'MailerService',
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>('MailerService');
  });

  it('should call mailerService.sendEmail with correct parameters', async () => {
    const sendEmailDto: SendEmailDto = {
      email: 'test@example.com',
      assunto: 'Test Subject',
      mensagem: 'Test Message',
    };

    await emailService.sendEmail(sendEmailDto);

    expect(mailerService.sendEmail).toHaveBeenCalledWith(
      sendEmailDto.email,
      sendEmailDto.assunto,
      sendEmailDto.mensagem,
    );
  });

  it('should return the result of mailerService.sendEmail', async () => {
    const sendEmailDto: SendEmailDto = {
      email: 'test@example.com',
      assunto: 'Test Subject',
      mensagem: 'Test Message',
    };
    const result: Email = {
      id: 0,
      email: '',
      mensagem: '',
      assunto: '',
    };
    jest.spyOn(mailerService, 'sendEmail').mockResolvedValue(result);

    const response = await emailService.sendEmail(sendEmailDto);

    expect(response).toBe(result);
  });

  it('should handle errors thrown by mailerService.sendEmail', async () => {
    const sendEmailDto: SendEmailDto = {
      email: 'test@example.com',
      assunto: 'Test Subject',
      mensagem: 'Test Message',
    };
    const error = new Error('Failed to send email');
    jest.spyOn(mailerService, 'sendEmail').mockRejectedValue(error);

    await expect(emailService.sendEmail(sendEmailDto)).rejects.toThrow(error);
  });
});
