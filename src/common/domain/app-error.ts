export enum AppErrorType {
  RESOURCE_NOT_FOUND,
  RESOURCE_CONFLICT,
  EXTERNAL_SERVICE_ERROR,
}

export class AppError extends Error {
  constructor(
    readonly message: string,
    readonly type: AppErrorType,
  ) {
    super(message);
  }
}
