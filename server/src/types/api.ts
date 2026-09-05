export interface ApiErrorDetail {
  message: string;
  code?: string;
  path?: string;
}

export interface ApiSuccessResponse<TData> {
  success: true;
  message: string;
  data: TData;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiErrorDetail[];
}
