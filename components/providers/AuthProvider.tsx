"use client";

import { authApi } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  updateUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = [
  APP_ROUTES.AUTH.LOGIN,
  APP_ROUTES.AUTH.SIGNUP,
  APP_ROUTES.AUTH.FORGOT_PASSWORD,
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUserSession() {
      try {
        // Intentar cargar usuario desde la sesión guardada
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          // Usuario existente en localStorage
          setUser(JSON.parse(storedUser));
        } else {
          // TODO: En producción, esto sería una llamada a tu API
          // const response = await fetch("/api/auth/me");
          // if (response.ok) {
          //   const userData = await response.json();
          //   setUser(userData);
          //   localStorage.setItem("user", JSON.stringify(userData));
          // }
        }
      } catch (error) {
        console.error("Error loading user session:", error);
      } finally {
        setIsLoading(false); // Marcar la carga como completada, sin importar el resultado
      }
    }

    loadUserSession();
  }, []);

  // Gestionar redirecciones basadas en autenticación
  useEffect(() => {
    // No hacer nada mientras estamos cargando
    if (isLoading) return;

    // Si no hay usuario y no estamos en una ruta pública, redirigir al login
    if (!user && !PUBLIC_PATHS.includes(pathname!)) {
      router.push(APP_ROUTES.AUTH.LOGIN);
    }

    // Si hay usuario y estamos en login/registro, redirigir al dashboard
    if (
      user &&
      (pathname === APP_ROUTES.AUTH.LOGIN ||
        pathname === APP_ROUTES.AUTH.SIGNUP)
    ) {
      router.push(APP_ROUTES.DASHBOARD.ROOT);
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);

      console.log("Response:", response);
      if (response.error) {
        throw new Error(response.error.message);
      }

      const userData = response.data.data.user;

      const user = {
        id: userData.id,
        name: userData.name || userData.username,
        email: userData.email,
        avatar:
          userData.avatar ||
          `https://ui-avatars.com/api/?name=${userData.name || userData.email.split("@")[0]}&background=random`,
      };

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", response.data.data.token);
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    try {
      //TODO: Implement signup logic here backend
      const response = await authApi.signup(name, email, password);

      console.log("Response:", response);

      if (response.error) {
        toast.error(
          `Ocurrio un error al registrar el usuario: ${response.error.message}`
        );
        throw new Error(response.error.message);
      }

      router.push(PUBLIC_PATHS[0]);
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push(APP_ROUTES.AUTH.LOGIN);
  };

  const updateUser = (userData: User) => {
    if (userData) {
      const updateUser = { ...user, ...userData };
      setUser(updateUser);
      localStorage.setItem("user", JSON.stringify(updateUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isLoading, updateUser }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
