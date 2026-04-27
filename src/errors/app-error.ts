import { HTTP_STATUS } from "../constants/http-status";

export interface AppErrorOptions {
  message: string;
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = new.target.name;
    this.statusCode = options.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    this.code = options.code ?? "INTERNAL_SERVER_ERROR";
    this.details = options.details ?? null;
    this.isOperational = true;

    const errorConstructor = Error as ErrorConstructor & {
      captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
    };

    errorConstructor.captureStackTrace?.(this, new.target);
  }
}
