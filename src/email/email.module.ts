import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { MailerService as NodemailerService } from '@nestjs-modules/mailer';
import { MailerServiceImpl } from './infra/external/mailer-service-impl';

@Module({
  controllers: [EmailController],
  providers: [
    EmailService,
    {
      provide: 'MailerService',
      useFactory: (nodemailerService: NodemailerService) => {
        return new MailerServiceImpl(nodemailerService);
      },
      inject: [NodemailerService],
    },
  ],
})
export default class EmailModule {}
