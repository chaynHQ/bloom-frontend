import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';

interface HttpError {
  data: { statusCode: number; message: string };
}
const isHttpError = (error: any): error is HttpError => 'data' in error;

const isSerializedError = (error: any): error is SerializedError => 'message' in error;

const isFetchBaseQueryError = (error: any): error is FetchBaseQueryError => 'error' in error;

export const getErrorMessage = (error: SerializedError | FetchBaseQueryError | HttpError) => {
  if (isHttpError(error)) {
    return error.data.message;
  } else if (isSerializedError(error)) {
    return error.message;
  } else if (isFetchBaseQueryError(error) && 'error' in error) {
    return error.error;
  } else {
    return 'unknown';
  }
};
