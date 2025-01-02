import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import Email from './domain/email';

const mockEmailService = {
  mockSendEmail: jest.fn(),
};

describe('EmailController', () => {
  let emailController: EmailController;
  let emailService: EmailService;

  let sendEmailDto: SendEmailDto;

  beforeEach(async () => {
    sendEmailDto = {
      email: 'test@example.com',
      assunto: 'Test Subject',
      mensagem: 'Test Body',
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: { sendEmail: mockEmailService.mockSendEmail },
        },
      ],
    }).compile();

    emailController = module.get<EmailController>(EmailController);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('sendEmail', () => {
    it('should call emailService.sendEmail with correct parameters', async () => {
      await emailController.sendEmail(sendEmailDto);
      expect(emailService.sendEmail).toHaveBeenCalledWith(sendEmailDto);
    });

    it('should return the result from emailService.sendEmail', async () => {
      const result: Email = {
        ...sendEmailDto,
        id: 1,
      };
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(result);
      expect(await emailController.sendEmail(sendEmailDto)).toBe(result);
    });
  });
});
