export interface IApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
}

export class ApiResponse<T> implements IApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
  constructor(status: number, message: string, data?: T) {
    this.status = status;
    this.message = message;
    this.data = data || null;
  }
}
