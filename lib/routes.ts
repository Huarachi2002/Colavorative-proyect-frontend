export const APP_ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
    SIGNUP: "/signup",
    FORGOT_PASSWORD: "/forgot-password",
  },
  DASHBOARD: {
    ROOT: "/dashboard",
    PROFILE: "/dashboard/profile",
    CREATE_PROJECT: "/dashboard/create-project",
    PROJECT: {
      ROOT: (id: string) => `/dashboard/project/${id}`,
      EXPORT: (id: string) => `/dashboard/project/${id}/export`,
      IMPORT: "/dashboard/project/import",
    },
  },
};

export const isPublicRoute = (path: string): boolean => {
  const publicRoutes = [
    APP_ROUTES.AUTH.LOGIN,
    APP_ROUTES.AUTH.SIGNUP,
    APP_ROUTES.AUTH.FORGOT_PASSWORD,
  ];

  return publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
};

export const getBaseRoute = (path: string): string => {
  const segment = path.split("/").filter(Boolean);
  return segment.length > 0 ? `/${segment[0]}` : "/";
};
