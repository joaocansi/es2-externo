import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { fromIni } from '@aws-sdk/credential-providers';
import { ConfigService } from '@nestjs/config';

export const fetchSecrets = async (secretName: string) => {
  const configService = new ConfigService();
  const client = new SecretsManagerClient({
    region: configService.get('AWS_REGION'),
    credentials: fromIni({ profile: 'default' }),
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      }),
    );
    return JSON.parse(response.SecretString);
  } catch (error) {
    throw error;
  }
};
