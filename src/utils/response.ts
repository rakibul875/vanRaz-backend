import { Response } from 'express';

export interface IMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: IMeta;
  data?: T;
}

export const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const responsePayload: Record<string, any> = {
    success: data.success,
    message: data.message || 'Operation successful',
  };

  if (data.meta) {
    responsePayload.meta = data.meta;
  }

  if (data.data !== undefined) {
    responsePayload.data = data.data;
  }

  res.status(data.statusCode).json(responsePayload);
};
