const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '');

export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface FastApiValidationItem {
  loc?: Array<string | number>;
  msg?: string;
}

function formatDetail(detail: unknown): string | null {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return (detail as FastApiValidationItem[])
      .map((item) => [item.loc?.join('.'), item.msg].filter(Boolean).join(': '))
      .filter(Boolean)
      .join('; ');
  }
  return null;
}

export async function postJson<TResponse>(path: string, body: unknown, signal?: AbortSignal): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    // Caller-initiated aborts and timeouts are surfaced as-is so the caller can tell them apart from network errors.
    if (e instanceof DOMException && (e.name === 'AbortError' || e.name === 'TimeoutError')) throw e;
    throw new ApiError(`Không kết nối được tới backend (${API_BASE_URL}). Hãy kiểm tra backend đã chạy và cấu hình CORS.`);
  }

  if (!response.ok) {
    let detail: string | null = null;
    try {
      detail = formatDetail((await response.json() as { detail?: unknown }).detail);
    } catch {
      // Response body is not JSON; fall back to the status line.
    }
    throw new ApiError(detail ?? `Backend trả về lỗi ${response.status} ${response.statusText}`, response.status);
  }

  return (await response.json()) as TResponse;
}
