"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  useEffect(() => {
    if (registered === "true") {
      toast.success("Registro exitoso. Puedes iniciar sesión ahora.");
    }
  }, [registered]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await login(email, password);
      console.log("Response:", response);

      toast.success("Inicio de sesión exitoso!");
      // route.push(APP_ROUTES.DASHBOARD.ROOT);
    } catch (error) {
      toast.error("Error al iniciar sesión. Verifica tus credenciales.");
      console.error("Error al iniciar sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen w-full'>
      {/* Columna Izquierda - Formulario */}
      <div className='flex w-full flex-col items-center justify-center bg-white px-4 sm:px-8 md:w-1/2 lg:px-12'>
        <div className='w-full max-w-md space-y-6'>
          <div className='space-y-2 text-center'>
            <h1 className='text-3xl font-bold tracking-tight'>Bienvenido</h1>
            <p className='text-gray-500'>
              Inicia sesión para colaborar en tiempo real
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </div>

      {/* Columna Derecha - Banner Visual */}
      <div className='hidden bg-primary-blue md:block md:w-1/2'>
        <div className='relative flex h-full w-full items-center justify-center overflow-hidden'>
          <div className='absolute inset-0 z-10 bg-black/20' />
          <Image
            src='/assets/auth-banner.png'
            alt='Colaboración en tiempo real'
            fill
            className='object-cover'
            priority
          />
          <div className='z-20 px-12 text-center text-white'>
            <h2 className='text-4xl font-bold leading-tight'>
              Diseña. Colabora. <br />
              En tiempo real.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
