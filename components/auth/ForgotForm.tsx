"use client";

import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Loader from "@/components/Loader";
import Link from "next/link";

interface ForgotFormProps {
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

export function ForgotForm({ onSubmit, isLoading }: ForgotFormProps) {
  const [email, setEmail] = useState<string>("");

  const [errors, setErrors] = useState<{
    email?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      email?: string;
    } = {};

    if (!email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <label htmlFor='email'>Correo Electronico Registrado</label>
        <Input
          id='email'
          type='email'
          placeholder='tu@ejemplo.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
      </div>

      <Button
        type='submit'
        disabled={isLoading}
        className='w-full bg-green-400 text-white hover:bg-green-500'
      >
        {isLoading ? (
          <>
            <Loader />
            Solicitando...
          </>
        ) : (
          "Solicitar cambio de contraseña"
        )}
      </Button>

      <div className='text-center text-sm'>
        <Link href='/login' className='text-blue-500 hover:underline'>
          Regresar al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
