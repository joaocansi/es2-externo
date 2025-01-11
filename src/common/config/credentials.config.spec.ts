import { ConfigService } from '@nestjs/config';
import { fetchSecrets } from '../@aws/secrets';
import credentialsConfig from './credentials.config';

jest.mock('@nestjs/config');
jest.mock('../@aws/secrets');

describe('credentialsConfig', () => {
  let configServiceMock: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configServiceMock = new ConfigService() as jest.Mocked<ConfigService>;
    (ConfigService as jest.Mock).mockImplementation(() => configServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar segredos AWS quando NODE_ENV for aws-prod', async () => {
    configServiceMock.get.mockImplementation((key) => {
      const envMap = {
        NODE_ENV: 'aws-prod',
        AWS_SECRET_NAME: 'my-secret',
      };
      return envMap[key];
    });

    const mockSecrets = {
      PAGSEGURO_AUTHORIZATION: 'mock-auth',
      PAGSEGURO_URL: 'mock-url',
      NODEMAILER_HOST: 'smtp.mock.com',
      NODEMAILER_PORT: '587',
      NODEMAILER_USER: 'user@mock.com',
      NODEMAILER_PASS: 'mock-pass',
    };
    (fetchSecrets as jest.Mock).mockResolvedValue(mockSecrets);

    const result = await credentialsConfig();

    expect(fetchSecrets).toHaveBeenCalledWith('my-secret');
    expect(result).toEqual({
      PAGSEGURO_AUTHORIZATION: 'mock-auth',
      PAGSEGURO_URL: 'mock-url',
      NODEMAILER_HOST: 'smtp.mock.com',
      NODEMAILER_PORT: 587,
      NODEMAILER_USER: 'user@mock.com',
      NODEMAILER_PASS: 'mock-pass',
    });
  });

  it('deve retornar configurações locais quando NODE_ENV não for aws-prod', async () => {
    configServiceMock.get.mockImplementation((key) => {
      const envMap = {
        NODE_ENV: 'local',
        PAGSEGURO_AUTHORIZATION: 'local-auth',
        PAGSEGURO_URL: 'local-url',
        NODEMAILER_HOST: 'smtp.local.com',
        NODEMAILER_PORT: '465',
        NODEMAILER_USER: 'local-user',
        NODEMAILER_PASS: 'local-pass',
      };
      return envMap[key];
    });

    const result = await credentialsConfig();

    expect(fetchSecrets).not.toHaveBeenCalled();
    expect(result).toEqual({
      PAGSEGURO_AUTHORIZATION: 'local-auth',
      PAGSEGURO_URL: 'local-url',
      NODEMAILER_HOST: 'smtp.local.com',
      NODEMAILER_PORT: '465',
      NODEMAILER_USER: 'local-user',
      NODEMAILER_PASS: 'local-pass',
    });
  });
});
