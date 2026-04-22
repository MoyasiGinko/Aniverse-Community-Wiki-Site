export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  input: string,
  init?: RequestInit & { suppressAuthPrompt?: boolean },
): Promise<T> {
  const response = await fetch(input, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    if (
      response.status === 401 &&
      !init?.suppressAuthPrompt &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new CustomEvent("aniverse:auth-required"));
    }

    throw new ApiError(
      data.error || `Request failed: ${response.status}`,
      response.status,
    );
  }

  return data;
}
