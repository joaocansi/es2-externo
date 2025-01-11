import { AppError, AppErrorType, appErrorTypeFromCode } from './app-error';

describe('AppError', () => {
  it('should create an AppError with correct message and type', () => {
    const message = 'Resource not found';
    const type = AppErrorType.RESOURCE_NOT_FOUND;

    const error = new AppError(message, type);

    expect(error.message).toBe(message);
    expect(error.type).toBe(type);
  });

  it('should create an AppError with RESOURCE_CONFLICT type', () => {
    const message = 'Resource conflict';
    const type = AppErrorType.RESOURCE_CONFLICT;

    const error = new AppError(message, type);

    expect(error.message).toBe(message);
    expect(error.type).toBe(type);
  });

  it('deve retornar RESOURCE_NOT_FOUND para código 404', () => {
    expect(appErrorTypeFromCode(404)).toBe(AppErrorType.RESOURCE_NOT_FOUND);
  });

  it('deve retornar RESOURCE_CONFLICT para código 409', () => {
    expect(appErrorTypeFromCode(409)).toBe(AppErrorType.RESOURCE_CONFLICT);
  });

  it('deve retornar EXTERNAL_SERVICE_ERROR para outros códigos', () => {
    expect(appErrorTypeFromCode(500)).toBe(AppErrorType.EXTERNAL_SERVICE_ERROR);
    expect(appErrorTypeFromCode(401)).toBe(AppErrorType.EXTERNAL_SERVICE_ERROR);
    expect(appErrorTypeFromCode(0)).toBe(AppErrorType.EXTERNAL_SERVICE_ERROR);
  });
});
