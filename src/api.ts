import { StatusCodes } from 'http-status-codes';

export interface IApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export class ApiResponse<T> implements IApiResponse<T> {
  status: number;
  message: string;
  data: T;
  constructor(status: number, message: string, data: T) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  static badRequest = <T>(data?: T, message?: string) => {
    return new ApiResponse(
      StatusCodes.BAD_REQUEST,
      message || '다시 요청해주세요.',
      data || false
    );
  };

  static unauthorized = () => {
    return new ApiResponse(StatusCodes.UNAUTHORIZED, 'No authorized.', false);
  };
}
