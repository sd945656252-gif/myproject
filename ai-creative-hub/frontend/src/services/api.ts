// API base URL - use relative path for local API routes
const API_BASE = "/api/v1";

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Don't redirect immediately to avoid issues
      }
      return { success: false, error: data.error || "Request failed" };
    }

    return data;
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Task API
export const taskApi = {
  get: (taskId: string) =>
    fetchApi<{ taskId: string; status: string; progress: number; result?: unknown }>(
      `/task?taskId=${taskId}`
    ),

  create: (body: Record<string, unknown>) =>
    fetchApi<{ taskId: string; status: string }>("/task", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// Export for services that need custom endpoints
export { fetchApi };

export default fetchApi;
