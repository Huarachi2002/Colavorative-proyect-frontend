"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_ROUTES } from "@/lib/routes";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function CreateProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement the API call to create a new project
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newProjectId = Math.random().toString(36).substring(2, 9);

      router.push(APP_ROUTES.DASHBOARD.PROJECT.ROOT(newProjectId));
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='mx-auto max-w-2xl'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Crear nuevo proyecto</h1>
        <p className='mt-1 text-gray-500'>
          Define los detalles basicos para tu nuevo proyecto colaborativo
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del proyecto</CardTitle>
            <CardDescription>
              Todos los campos son obligatorios para crear tu proyecto.
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='Nombre del proyecto'>Nombre del proyecto</Label>
              <Input
                id='name'
                name='name'
                placeholder='Nombre del proyecto'
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={50}
                disabled={isLoading}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Descripción</Label>
              <Textarea
                id='description'
                name='description'
                placeholder='Descripción del proyecto'
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                minLength={10}
                maxLength={500}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push(APP_ROUTES.DASHBOARD.ROOT)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creando...
                </>
              ) : (
                "Crear proyecto"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
