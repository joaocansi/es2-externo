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

export const appErrorTypeFromCode = (code: number) => {
  switch (code) {
    case 404:
      return AppErrorType.RESOURCE_NOT_FOUND;
    case 409:
      return AppErrorType.RESOURCE_CONFLICT;
    default:
      return AppErrorType.EXTERNAL_SERVICE_ERROR;
  }
};
