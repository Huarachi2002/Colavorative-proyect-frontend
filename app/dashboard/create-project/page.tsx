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
import { Textarea } from "@/components/ui/textarea";
import { APP_ROUTES } from "@/lib/routes";
import { Loader2, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { projectsApi, usersRoomsApi } from "@/lib/api";
import { toast } from "sonner";
import Loader from "@/components/Loader";

export default function CreateProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState(5);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");

  const handleAddCollaborator = () => {
    if (!emailInput) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    if (collaborators.length >= maxMembers - 1) {
      setError(`Solo puedes invitar a ${maxMembers - 1} colaboradores`);
      return;
    }

    if (collaborators.includes(emailInput)) {
      setError("Este email ya ha sido invitado");
      return;
    }

    setCollaborators([...collaborators, emailInput]);
    setEmailInput("");
    setError("");
  };

  const handleRemoveCollaborator = (email: string) => {
    setCollaborators(collaborators.filter((c) => c !== email));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const projectData = {
        idRoom: Math.random().toString(36).substring(2, 8),
        name,
        description,
        maxMembers,
        // collaborators,
        createdBy: user?.email || "anonymous@example.com",
      };

      console.log("Datos para enviar al backend:", projectData);

      var response = await projectsApi.create(user!.id, projectData);
      console.log("Response Project", response);

      response = await usersRoomsApi.sendInvitation({
        code: response.data.data.room.code,
        name: response.data.data.room.name,
        emails: collaborators,
      });

      console.log("Response Invitacion", response);

      if (response.error) {
        setError("Error al enviar invitaciones: " + response.error.message);
        return;
      }
      // Por ahora, guardar en localStorage para simular persistencia
      // const existingProjects = JSON.parse(
      //   localStorage.getItem("projects") || "[]"
      // );
      // localStorage.setItem(
      //   "projects",
      //   JSON.stringify([...existingProjects, projectData])
      // );

      // TODO: Implement the API call POST to create a new project
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Sala creada y colabordadores invitados con éxito!");
      toast.success("Espere un momento mientras se redirige...");
      router.push(APP_ROUTES.DASHBOARD.PROJECT.ROOT(projectData.idRoom));
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='mx-auto max-w-2xl pt-10'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Crear nuevo proyecto</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del proyecto</CardTitle>
          </CardHeader>

          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <CardTitle>Nombre del proyecto</CardTitle>
              <Input
                id='name'
                name='name'
                placeholder='Nombre del proyecto'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={50}
                disabled={isLoading}
              />
            </div>

            <div className='space-y-2'>
              <CardTitle>Descripción</CardTitle>
              <Textarea
                id='description'
                name='description'
                placeholder='Descripción del proyecto'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                minLength={5}
                maxLength={500}
                disabled={isLoading}
              />
            </div>
            <div className='space-y-2'>
              <CardTitle>Maximo de miembros (1 - 10)</CardTitle>
              <Input
                value={maxMembers}
                id='maxMembers'
                name='maxMembers'
                type='number'
                min={1}
                max={10}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value)) {
                    setMaxMembers(value);
                  }
                }}
                disabled={isLoading}
                required
              />
            </div>
            <div className='space-y-2'>
              <Input
                id='email'
                type='email'
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder='correo@ejemplo.com'
                disabled={isLoading}
              />
              <Button
                type='button'
                onClick={handleAddCollaborator}
                disabled={isLoading}
                className='w-full bg-green-300 text-black hover:bg-green-400'
              >
                Agregar colaborador
              </Button>
            </div>
            {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
          </CardContent>

          {/* Lista de colaboradores */}
          {collaborators.length > 0 && (
            <div className='ml-6 space-x-2'>
              <CardTitle>Colaboradores invitados:</CardTitle>
              <ul className='space-y-1'>
                {collaborators.map((email) => (
                  <li
                    key={email}
                    className='flex items-center justify-between rounded-md bg-gray-50 px-3 py-2'
                  >
                    <span className='text-sm text-gray-800'>{email}</span>

                    <Button
                      type='button'
                      onClick={() => handleRemoveCollaborator(email)}
                      className='text-red-500 hover:text-red-700'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <CardFooter className='flex justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push(APP_ROUTES.DASHBOARD.ROOT)}
              disabled={isLoading}
              className='bg-red-400 text-white hover:bg-red-500'
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={isLoading}
              className='bg-blue-400 text-white hover:bg-blue-500'
            >
              {isLoading ? (
                <>
                  <Loader />
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
