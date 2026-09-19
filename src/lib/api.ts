import { environment } from "@/config/environment";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown
  ) {
    super(`API request failed with status ${status}`);

    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro inesperado."
): string {
  if (error instanceof ApiError) {
    if (typeof error.data === "string" && error.data.trim()) {
      return error.data;
    }

    if (isRecord(error.data)) {
      const message = error.data.message;

      if (typeof message === "string") {
        return message;
      }

      if (Array.isArray(message)) {
        const messages = message.filter((item): item is string => typeof item === "string");

        if (messages.length > 0) {
          return messages.join("\n");
        }
      }
    }
  }

  if (error instanceof TypeError) {
    return "Não foi possível conectar à API.";
  }

  return fallback;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${environment.apiUrl}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}
