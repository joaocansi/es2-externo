import EmailModule from './email/email.module';
import CobrancaModule from './cobrancas/cobranca.module';
import credentialsConfig from './common/config/credentials.config';
import AppController from './app.controller';
import AppService from './app.service';
import { DatabaseModule } from './database/database.module';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './email/domain/mailer-service';
import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

const MailerModule = NestMailerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return {
      transport: {
        host: configService.get('NODEMAILER_HOST'),
        port: configService.get<number>('NODEMAILER_PORT'),
        auth: {
          user: configService.get('NODEMAILER_USER'),
          pass: configService.get('NODEMAILER_PASS'),
        },
      },
    };
  },
});

const ConfigModule = NestConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'],
  load: [credentialsConfig],
  ignoreEnvFile: process.env.NODE_ENV === 'aws-prod' ? true : false,
  isGlobal: true,
});

const appService = {
  provide: 'AppService',
  useFactory: (mailerService: MailerService, dataSource: DataSource) => {
    return new AppService(mailerService, dataSource);
  },
  inject: ['MailerService', 'DataSource'],
};

@Module({
  imports: [
    ConfigModule,
    MailerModule,
    DatabaseModule,
    EmailModule,
    CobrancaModule,
  ],
  controllers: [AppController],
  providers: [appService],
})
export class AppModule {}
