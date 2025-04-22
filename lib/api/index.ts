const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

type ApiResponse<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: {
        message: string;
        code?: string;
      };
    };

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;

    console.log(`🚀 Request to ${url}`, {
      method: options.method || "GET",
      body: options.body ? JSON.parse(options.body as string) : undefined,
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    let data;
    if (isJson) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.warn("Response is not JSON:", text);
      data = { message: text };
    }

    console.log(`📥 Response from ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      data,
    });

    if (!response.ok) {
      return {
        data: null,
        error: {
          message:
            data.message || `Error: ${response.status} ${response.statusText}`,
          code: data.statusCode || response.status.toString(),
        },
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado",
      },
    };
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    fetchApi("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (username: string, email: string, password: string) =>
    fetchApi("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
};

export const projectsApi = {
  getAll: () => fetchApi("/projects"),

  getById: (id: string) => fetchApi(`/projects/${id}`),

  create: (data: { name: string; description: string }) =>
    fetchApi("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; description?: string }) =>
    fetchApi(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi(`/projects/${id}`, {
      method: "DELETE",
    }),

  addCollaborator: (id: string, email: string) =>
    fetchApi(`/projects/${id}/collaborators`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  removeCollaborator: (projectId: string, userId: string) =>
    fetchApi(`/projects/${projectId}/collaborators/${userId}`, {
      method: "DELETE",
    }),
};

export const usersApi = {
  getCurrent: () => fetchApi("/users/me"),

  updateProfile: (data: Partial<{ name: string; email: string }>) =>
    fetchApi("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
