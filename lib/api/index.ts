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

const isBrowser = typeof window !== "undefined";

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (isBrowser) {
      const token = localStorage.getItem("token");
      if (token) {
        headers["auth-token"] = token;
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;

    console.log(`🚀 Request to ${url}`, {
      method: options.method || "GET",
      body: options.body ? JSON.parse(options.body as string) : undefined,
      headers: {
        ...headers,
        "auth-token": headers["auth-token"] ? "PRESENTE" : "NO PRESENTE",
      }, // No logueamos el token completo por seguridad
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
    console.log("Error in fetchApi:", error);
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

async function fetchApiWithProgress<T>(
  endpoint: string,
  options: RequestInit = {},
  onProgress?: (progressEvent: any) => void
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(options.method || "GET", url);

      // Añadir headers
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };

      if (isBrowser) {
        const token = localStorage.getItem("token");
        if (token) {
          headers["auth-token"] = token;
        }
      }

      Object.entries(headers).forEach(([key, value]) => {
        if (value) xhr.setRequestHeader(key, value as string);
      });

      // Event listeners
      xhr.onload = function () {
        let responseData;
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch (e) {
          responseData = { message: xhr.responseText };
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            data: responseData,
            error: null,
          });
        } else {
          resolve({
            data: null,
            error: {
              message: responseData.message || `Error: ${xhr.status}`,
              code: responseData.statusCode || xhr.status.toString(),
            },
          });
        }
      };

      xhr.onerror = function () {
        resolve({
          data: null,
          error: {
            message: "Error de red al realizar la solicitud",
          },
        });
      };

      if (onProgress) {
        xhr.upload.onprogress = onProgress;
      }

      // Enviar
      xhr.send(options.body as FormData);
    });
  } catch (error) {
    console.error("❌ Fetch error:", error);
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

  forgotPassword: (email: string) =>
    fetchApi("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

export const projectsApi = {
  getAll: () => fetchApi("/room"),

  getById: (id: string) => fetchApi(`/room/${id}`),

  create: (
    id: string,
    data: {
      idRoom: string;
      name: string;
      description: string;
      maxMembers: number;
      createdBy: string;
    }
  ) =>
    fetchApi(`/room/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: { name: string; description: string; maxMembers: number }
  ) =>
    fetchApi(`/room/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi(`/room/${id}`, {
      method: "DELETE",
    }),

  validateCode: (code: string) =>
    fetchApi(`/room/validate-code/${code}`, { method: "GET" }),

  addCollaborator: (id: string, email: string) =>
    fetchApi(`/room/${id}/collaborators`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  removeCollaborator: (projectId: number, email: string) =>
    fetchApi(`/room/${projectId}/collaborators/${email}`, {
      method: "PUT",
    }),

  createFromSketch: (data: {
    name: string;
    description: string;
    elements: any[];
  }) =>
    fetchApi("/room", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const importApi = {
  processSketch: (
    formData: FormData,
    onProgress?: (progressEvent: any) => void
  ) => {
    return fetchApiWithProgress(
      "/import/sketch",
      {
        method: "POST",
        body: formData,
      },
      onProgress
    );
  },
};

export const usersRoomsApi = {
  sendInvitation: (data: { code: string; name: string; emails: string[] }) =>
    fetchApi(`/user-room/invitation`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  joinProject: (data: { idRoom: number; idUser: string }) =>
    fetchApi("/user-room/join-room", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  validateJoinProject: (idRoom: string, idUser: string) =>
    fetchApi(`/user-room/${idUser}/validate-join/${idRoom}`, {
      method: "GET",
    }),
};

export const usersApi = {
  getCurrent: () => fetchApi("/user/me"),

  getByEmail: (email: string) =>
    fetchApi(`/user/email/${email}`, {
      method: "GET",
    }),

  updateProfile: (id: string, data: { name: string; email: string }) =>
    fetchApi(`/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updatePassword: (id: string, data: { password: string; newPass: string }) =>
    fetchApi(`/user/password/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getRoomsbyUserId: (userId: string) =>
    fetchApi(`/user/${userId}/rooms`, {
      method: "GET",
    }),

  getCreateProjects: (userId: string) =>
    fetchApi(`/user/${userId}/rooms-created`, {
      method: "GET",
    }),

  getInvitedProjects: (userId: string) =>
    fetchApi(`/user/${userId}/rooms-invited `, {
      method: "GET",
    }),
};
