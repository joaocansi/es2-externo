import { ConfigService } from '@nestjs/config';
import { fetchSecrets } from '../@aws/secrets';

export default async () => {
  const configService = new ConfigService();
  if (configService.get('NODE_ENV') === 'aws-prod') {
    const secretName = 'prod/es2-externo';
    const secrets = await fetchSecrets(secretName);

    return {
      PAGSEGURO_AUTHORIZATION: secrets.PAGSEGURO_AUTHORIZATION,
      PAGSEGURO_URL: secrets.PAGSEGURO_URL,
      NODEMAILER_HOST: secrets.NODEMAILER_HOST,
      NODEMAILER_PORT: +secrets.NODEMAILER_PORT,
      NODEMAILER_USER: secrets.NODEMAILER_USER,
      NODEMAILER_PASS: secrets.NODEMAILER_PASS,
      ALUGUEL_MICROSSERVICE_URL: secrets.ALUGUEL_MICROSSERVICE_URL,
    };
  }

  return {
    PAGSEGURO_AUTHORIZATION: configService.get('PAGSEGURO_AUTHORIZATION'),
    PAGSEGURO_URL: configService.get('PAGSEGURO_URL'),
    NODEMAILER_HOST: configService.get('NODEMAILER_HOST'),
    NODEMAILER_PORT: configService.get('NODEMAILER_PORT'),
    NODEMAILER_USER: configService.get('NODEMAILER_USER'),
    NODEMAILER_PASS: configService.get('NODEMAILER_PASS'),
    ALUGUEL_MICROSSERVICE_URL: configService.get('ALUGUEL_MICROSSERVICE_URL'),
  };
};
