"use client";

import { SignupForm } from "@/components/auth/SignupForm";
import Image from "next/image";
import { useState } from "react";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement signup logic here backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      window.location.href = "/login?registered=true";
    } catch (error) {
      console.error("Error al registrarse:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen w-full'>
      {/* Columna Izquierda - Formulario */}
      <div className='flex w-full flex-col items-center justify-center bg-primary-grey-500 px-4 sm:px-8 md:w-1/2 lg:px-12'>
        <div className='w-full max-w-md space-y-6'>
          <div className='space-y-2 text-center'>
            <h1 className='text-3xl font-bold tracking-tight'>Crear cuenta</h1>
            <p className='text-gray-500'>
              Registrate para empezar a colaborar en tiempo real
            </p>
          </div>

          <SignupForm onSubmit={handleSignup} isLoading={isLoading} />
        </div>
      </div>

      {/* Columna Derecha - Banner Visual */}
      <div className='hidden bg-primary-blue md:block md:w-1/2'>
        <div className='relative flex h-full w-full items-center justify-center overflow-hidden'>
          <div className='absolute inset-0 z-10 bg-black/20'>
            <Image
              src='/assets/auth-banner.png'
              alt='Colaboración en tiempo real'
              fill
              className='object-cover'
              priority
            />
            <div className='z-20 px-12 text-center text-white'>
              <h2 className='text-4xl font-bold leading-tight'>
                Comparte tus ideas. <br />
                Crea sin limites.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
