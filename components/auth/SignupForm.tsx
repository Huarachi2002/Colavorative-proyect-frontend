"use client";

import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface SignupFormProps {
  onSubmit: (email: string, password: string, name: string) => void;
  isLoading: boolean;
}

export function SignupForm({ onSubmit, isLoading }: SignupFormProps) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!acceptTerms) {
      newErrors.terms = "Debes aceptar los términos y condiciones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(email, password, name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <label htmlFor='name'>Nombre de Usuario</label>
        <Input
          id='name'
          type='text'
          placeholder='Juan Pérez'
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
      </div>
      <div className='space-y-2'>
        <label htmlFor='name'>Correo Electronico</label>
        <Input
          id='email'
          type='email'
          placeholder='tu@ejemplo.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password'>Contraseña</Label>
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

      <div className='space-y-2'>
        <Label htmlFor='password'>Confirmar Contraseña</Label>
        <Input
          id='confirmPassword'
          type='password'
          placeholder='********'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          className={errors.confirmPassword ? "border-red-500" : ""}
        />
        {errors.confirmPassword && (
          <p className='text-sm text-red-500'>{errors.confirmPassword}</p>
        )}
      </div>

      <div className='flex items-start space-x-2'>
        <Checkbox
          id='terms'
          checked={acceptTerms}
          onCheckedChange={(checked: boolean) =>
            setAcceptTerms(checked === true)
          }
          className={errors.terms ? "border-red-500" : ""}
        />
        <div className='grid gap-1.5 leading-none'>
          <label
            htmlFor='terms'
            className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Acepto los terminos y condiciones
          </label>
          {errors.terms && (
            <p className='text-sm text-red-500'>{errors.terms}</p>
          )}
        </div>
      </div>

      <Button type='submit' disabled={isLoading} className='w-full'>
        {isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Registrando...
          </>
        ) : (
          "Crear cuenta"
        )}
      </Button>

      <div className='text-center text-sm'>
        Ya tienes una cuenta?{" "}
        <Link href='/login' className='text-primary-blue hover:underline'>
          Iniciar sesión
        </Link>
      </div>
    </form>
  );
}
