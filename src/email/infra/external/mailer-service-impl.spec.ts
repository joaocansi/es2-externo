import Email from 'src/email/domain/email';
import { MailerServiceImpl } from './mailer-service-impl';
import { MailerService as NodemailerService } from '@nestjs-modules/mailer';
import { AppError, AppErrorType } from 'src/common/domain/app-error';

jest.mock('@nestjs-modules/mailer', () => ({
  MailerService: jest.fn().mockImplementation(() => ({
    sendMail: jest.fn(),
    addTransporter: jest.fn(),
    verifyAllTransporters: jest.fn(),
  })),
}));

describe('MailerServiceImpl', () => {
  let mailerService: MailerServiceImpl;
  let nodemailerService: NodemailerService;

  beforeEach(() => {
    nodemailerService = new NodemailerService(null, null);
    mailerService = new MailerServiceImpl(nodemailerService);
  });

  it('should create a new email and push it to the emails array', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const body = 'This is a test body';

    (nodemailerService.sendMail as jest.Mock).mockResolvedValueOnce({
      accepted: [to],
    });

    const email = await mailerService.sendEmail(to, subject, body);

    expect(mailerService['emails']).toHaveLength(1);
    expect(mailerService['emails'][0]).toBe(email);

    expect(email.id).toBe(1);
    expect(email.email).toBe(to);
    expect(email.assunto).toBe(subject);
    expect(email.mensagem).toBe(body);

    expect(nodemailerService.sendMail).toHaveBeenCalledWith({
      to,
      subject,
      text: body,
    });
  });

  it('should throw an AppError if sendMail fails', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const body = 'Test Body';

    jest
      .spyOn(nodemailerService, 'sendMail')
      .mockRejectedValue(new Error('SMTP Error'));

    await expect(mailerService.sendEmail(to, subject, body)).rejects.toEqual(
      new AppError(
        'Não foi possível enviar e-email',
        AppErrorType.EXTERNAL_SERVICE_ERROR,
      ),
    );
  });

  it('should create a new email and push it to the emails array', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const body = 'This is a test body';

    (nodemailerService.sendMail as jest.Mock).mockResolvedValueOnce({
      accepted: [to],
    });

    const email = await mailerService.sendEmail(to, subject, body);

    expect(mailerService['emails']).toHaveLength(1);
    expect(mailerService['emails'][0]).toBe(email);

    expect(email.id).toBe(1);
    expect(email.email).toBe(to);
    expect(email.assunto).toBe(subject);
    expect(email.mensagem).toBe(body);

    expect(nodemailerService.sendMail).toHaveBeenCalledWith({
      to,
      subject,
      text: body,
    });
  });

  it('should increment the email id for subsequent emails', async () => {
    const to1 = 'first@example.com';
    const subject1 = 'First Subject';
    const body1 = 'First body';

    const to2 = 'second@example.com';
    const subject2 = 'Second Subject';
    const body2 = 'Second body';

    (nodemailerService.sendMail as jest.Mock).mockResolvedValue({
      accepted: [to1],
    });

    await mailerService.sendEmail(to1, subject1, body1);
    (nodemailerService.sendMail as jest.Mock).mockResolvedValue({
      accepted: [to2],
    });

    const email2 = await mailerService.sendEmail(to2, subject2, body2);

    expect(email2.id).toBe(2);
  });

  it('should resolve with the email object', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const body = 'This is a test body';

    (nodemailerService.sendMail as jest.Mock).mockResolvedValue({
      accepted: [to],
    });

    const email = await mailerService.sendEmail(to, subject, body);

    expect(email).toBeInstanceOf(Email);
    expect(email.email).toBe(to);
    expect(email.assunto).toBe(subject);
    expect(email.mensagem).toBe(body);
  });
});
