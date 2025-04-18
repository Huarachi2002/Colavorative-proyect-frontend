"use client";

import { useState } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen w-full'>
      {/* Columna Izquierda - Formulario */}
      <div className='bg-primary-grey-500 flex w-full flex-col items-center justify-center px-4 sm:px-8 md:w-1/2 lg:px-12'>
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
      <div className='bg-primary-blue hidden md:block md:w-1/2'>
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
