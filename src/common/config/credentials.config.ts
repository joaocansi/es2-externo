import { ConfigService } from '@nestjs/config';
import { fetchSecrets } from '../@aws/secrets';

export default async () => {
  const configService = new ConfigService();
  if (configService.get('NODE_ENV') === 'prod') {
    const secretName = configService.get('AWS_SECRET_NAME');
    const secrets = await fetchSecrets(secretName);

    console.log(secretName, secrets);

    return {
      pagseguroAuthorization: secrets.PAGSEGURO_AUTHORIZATION,
      pagseguroUrl: secrets.PAGSEGURO_URL,
      nodemailerHost: secrets.NODEMAILER_HOST,
      nodemailerPort: +secrets.NODEMAILER_PORT,
      nodemailerUser: secrets.NODEMAILER_USER,
      nodemailerPass: secrets.NODEMAILER_PASS,
    };
  }

  return {
    pagseguroAuthorization: configService.get('PAGSEGURO_AUTHORIZATION'),
    pagseguroUrl: configService.get('PAGSEGURO_URL'),
    nodemailerHost: configService.get('NODEMAILER_HOST'),
    nodemailerPort: configService.get('NODEMAILER_PORT'),
    nodemailerUser: configService.get('NODEMAILER_USER'),
    nodemailerPass: configService.get('NODEMAILER_PASS'),
  };
};
