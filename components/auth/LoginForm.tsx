"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { APP_ROUTES } from "@/lib/routes";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='email'>Correo Electronico</Label>
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

      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='password'>Contraseña</Label>
          <Link
            href='/forgot-password'
            className='text-primary-blue text-sm hover:underline'
          >
            Olvidaste tu contraseña?
          </Link>
        </div>

        <Input
          id='password'
          type='password'
          placeholder='********'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && (
          <p className='text-sm text-red-500'>{errors.password}</p>
        )}
      </div>

      <div className='flex items-center space-x-2'>
        <Checkbox
          id='rememberMe'
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />

        <Label htmlFor='remember' className='text-sm font-normal'>
          Recordar mi sesión
        </Label>
      </div>

      <Button type='submit' disabled={isLoading} className='w-full'>
        {isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Iniciando sesión...
          </>
        ) : (
          "Iniciar sesión"
        )}
      </Button>

      <div className='text-center text-sm'>
        No tienes una cuenta?{" "}
        <Link
          href={APP_ROUTES.AUTH.SIGNUP}
          className='text-primary-blue hover:underline'
        >
          Registrate
        </Link>
      </div>
    </form>
  );
}
