import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { ConfigService } from '@nestjs/config';
import { fetchSecrets } from './secrets';

jest.mock('@aws-sdk/client-secrets-manager');
jest.mock('@nestjs/config');

describe('fetchSecrets', () => {
  let mockSend: jest.Mock;
  let mockGet: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn();
    (SecretsManagerClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }));

    mockGet = jest.fn();
    (ConfigService as jest.Mock).mockImplementation(() => ({
      get: mockGet,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and parse secrets correctly', async () => {
    const secretName = 'testSecret';
    const mockSecret = { username: 'testUser', password: 'testPass' };
    mockGet.mockReturnValue('us-east-1'); // Mock region
    mockSend.mockResolvedValue({
      SecretString: JSON.stringify(mockSecret),
    });

    const result = await fetchSecrets(secretName);

    expect(mockGet).toHaveBeenCalledWith('AWS_REGION');
    expect(result).toEqual(mockSecret);
  });

  it('should throw an error if fetching secrets fails', async () => {
    const secretName = 'testSecret';
    const mockError = new Error('Failed to fetch secrets');
    mockGet.mockReturnValue('us-east-1'); // Mock region
    mockSend.mockRejectedValue(mockError);

    await expect(fetchSecrets(secretName)).rejects.toThrow(
      'Failed to fetch secrets',
    );
    expect(mockGet).toHaveBeenCalledWith('AWS_REGION');
  });
});
