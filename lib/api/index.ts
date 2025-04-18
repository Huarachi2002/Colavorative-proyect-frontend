import { create } from "domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: data.message || "Ocurrió un error inesperado",
          code: data.code,
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
    fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (name: string, email: string, password: string) =>
    fetchApi("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () =>
    fetchApi("/auth/logout", {
      method: "POST",
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
