import EmailModule from './email/email.module';
import PagamentoModule from './pagamentos/pagamento.module';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import credentialsConfig from './common/config/credentials.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      load: [credentialsConfig],
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get('nodemailerHost'),
            port: configService.get<number>('nodemailerPort'),
            auth: {
              user: configService.get('nodemailerUser'),
              pass: configService.get('nodemailerPass'),
            },
          },
        };
      },
    }),
    DatabaseModule,
    EmailModule,
    PagamentoModule,
  ],
})
export class AppModule {}
