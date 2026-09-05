const defaultApiBaseUrl = 'http://localhost:5010';
const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() || defaultApiBaseUrl).replace(
  /\/+$/,
  '',
);
const apiBaseUrl = configuredApiBaseUrl.endsWith('/api')
  ? configuredApiBaseUrl
  : `${configuredApiBaseUrl}/api`;
const serverUnavailableMessage = 'تعذر الاتصال بالخادم';

interface ApiErrorDetail {
  message: string;
  code?: string;
  path?: string;
}

interface ApiSuccessResponse<TData> {
  success: true;
  message: string;
  data: TData;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiErrorDetail[];
}

type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;

export class ApiClientError extends Error {
  readonly errors?: ApiErrorDetail[];
  readonly status?: number;

  constructor(message: string, status?: number, errors?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiClientError';

    if (status) {
      this.status = status;
    }

    if (errors?.length) {
      this.errors = errors;
    }
  }
}

function createUrl(path: string) {
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseResponse<TData>(response: Response): Promise<ApiResponse<TData> | null> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  return (await response.json()) as ApiResponse<TData>;
}

export async function apiRequest<TData>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;

  try {
    response = await fetch(createUrl(path), {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch {
    throw new ApiClientError(serverUnavailableMessage);
  }

  const payload = await parseResponse<TData>(response);

  if (!response.ok) {
    throw new ApiClientError(
      payload?.message ?? serverUnavailableMessage,
      response.status,
      payload?.success === false ? payload.errors : undefined,
    );
  }

  if (!payload || payload.success !== true) {
    throw new ApiClientError(serverUnavailableMessage, response.status);
  }

  return payload.data;
}
