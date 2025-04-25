"use client";

import Loader from "@/components/Loader";
import { useAuth } from "@/components/providers/AuthProvider";
import { usersApi } from "@/lib/api";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("User ID:", user?.id);
      console.log("Name:", name);
      console.log("Email:", email);
      const response = await usersApi.updateProfile(user!.id, { name, email });
      console.log("Response Update:", response);
      if (response.error) {
        console.error("Error al actualizar el perfil:", response.error);
        toast.error("Error al actualizar el perfil: " + response.error.message);
        return;
      }

      updateUser({ id: user!.id, name, email });

      toast.success("Perfil actualizado exitosamente!");
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast.error(
        "Error al actualizar el perfil. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("La confirmacion de contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await usersApi.updatePassword(user!.id, {
        password: currentPassword,
        newPass: newPassword,
      });

      console.log("Response Change Password:", response);

      if (response.error) {
        console.error("Error al actualizar la contraseña:", response.error);
        toast.error(
          "Error al actualizar la contraseña: " + response.error.message
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Contraseña actualizada correctamente");
    } catch (error) {
      toast.error(
        "Error al cambiar la contraseña: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Loader />;
  }

  return (
    <div className='container max-w-3xl py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Perfil de Usuario</h1>

      <Tabs defaultValue='profile' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='profile'>Información de Cuenta</TabsTrigger>
          <TabsTrigger value='password'>Cambiar Contraseña</TabsTrigger>
        </TabsList>

        <TabsContent value='profile'>
          <Card>
            <CardHeader>
              <CardTitle>Informacion del Perfil</CardTitle>
              <CardDescription>
                Actualiza los datos de tu cuenta.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className='space-y-4'>
                <div className='space-y-1'>
                  <Label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Nombre de Usuario
                  </Label>
                  <Input
                    id='name'
                    placeholder='Nombre de Usuario'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className='space-y-1'>
                  <Label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Correo Electronico
                  </Label>
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    disabled={isLoading}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className='bg-red-400 text-white hover:bg-red-500'
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  className='bg-blue-400 text-white hover:bg-blue-500'
                  disabled={
                    isLoading ||
                    !name ||
                    !email ||
                    (name === user?.name && email === user?.email)
                  }
                >
                  {isLoading ? "Actualizando..." : "Guardar cambios"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value='password'>
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña. Deberas ingresar tu contraseña actual.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className='space-y-4'>
                <div className='space-y-1'>
                  <Label
                    htmlFor='currentPassword'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Contraseña Actual
                  </Label>
                  <Input
                    id='currentPassword'
                    type='password'
                    placeholder='********'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className='space-y-1'>
                  <Label
                    htmlFor='newPassword'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Nueva Contraseña
                  </Label>
                  <Input
                    id='newPassword'
                    type='password'
                    placeholder='********'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className='space-y-1'>
                  <Label
                    htmlFor='confirmPassword'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Confirmar nueva contraseña
                  </Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    placeholder='********'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className='bg-red-400 text-white hover:bg-red-500'
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  className='bg-blue-400 text-white hover:bg-blue-500'
                  disabled={
                    isLoading ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {isLoading ? "Actualizando..." : "Cambiar contraseña"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
