"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { APP_ROUTES } from "@/lib/routes";
import { Project, User } from "@/types/type";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { projectsApi, usersApi, usersRoomsApi } from "@/lib/api";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import AccessDenied from "@/components/AccessDenied";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState<Project>({
    id: 0,
    idRoom: "",
    name: "",
    description: "",
    code: "",
    createdAt: "",
    activeUserCount: 0,
    maxMembers: 0,
    createdBy: "",
  });

  // Formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState(5);
  const [collaboratorsEmails, setCollaboratorsEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");

  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  useEffect(() => {
    const fetchProject = async () => {
      try {
        //TODO: En producción: GET /api/projects/{projectId}
        console.log("projectId", projectId);
        const response = await projectsApi.getById(projectId);
        console.log("project", response);

        if (response.error) {
          setError("Error al cargar la sala");
          return;
        }

        const projectFound = response.data.data.room;
        const collaboratorEmails = projectFound.users
          .filter((u: any) => u.status === "INVITADO")
          .map((u: any) => u.user.email);
        console.log("collaboratorEmails", collaboratorEmails);

        const collaboratorProject = projectFound.users
          .filter((u: any) => u.status === "INVITADO")
          .map((u: any) => u.user);

        console.log("collaboratorProject", collaboratorProject);

        setProject(projectFound);
        setTitle(projectFound.name);
        setDescription(projectFound.description);
        setMaxMembers(projectFound.maxMembers);
        setCollaboratorsEmails(collaboratorEmails);
      } catch (error) {
        console.error("Error al cargar el proyecto:", error);
        setError("Error loading project");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const isCreator = () => {
    console.log("isCreator", project?.createdBy, user?.email);
    return project?.createdBy === user?.email;
  };

  const handleAddCollaborator = () => {
    if (!emailInput) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    // Validar límite de miembros
    if (collaboratorsEmails.length >= maxMembers - 1) {
      setError(`Solo puedes invitar a ${maxMembers - 1} colaboradores`);
      return;
    }

    // Verificar que no esté repetido
    if (collaboratorsEmails.includes(emailInput)) {
      setError("Este colaborador ya fue agregado");
      return;
    }

    // Verificar que no sea el creador
    if (emailInput === project?.createdBy) {
      setError("No puedes añadirte a ti mismo como colaborador");
      return;
    }

    setCollaboratorsEmails([...collaboratorsEmails, emailInput]);
    setEmailInput("");
    setError("");
  };

  const handleRemoveCollaborator = async (email: string) => {
    try {
      console.log("handleRemoveCollaborator email", email);
      const responseUser = await usersApi.getByEmail(email);
      if (responseUser.data.message !== "El usuario no existe") {
        const response = await projectsApi.removeCollaborator(
          project.id,
          email
        );
        console.log("response", response);

        if (response.error) {
          setError("Error al eliminar el colaborador");
          return;
        }

        toast.success(
          `Colaborador ${email} BLOQUEADO correctamente del proyecto`
        );
      }

      console.log("collaboratorEmails AFTER:", collaboratorsEmails);
      setCollaboratorsEmails(collaboratorsEmails.filter((c) => c !== email));
      console.log("collaboratorEmails BEFORE:", collaboratorsEmails);
    } catch (error) {
      console.error("Error al eliminar colaborador:", error);
      setError("Error al eliminar el colaborador");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCreator()) {
      setError("Solo el creador puede editar este proyecto");
      return;
    }

    setIsSaving(true);

    try {
      //TODO: En producción: PUT /api/projects/{projectId}
      const response = await projectsApi.update(projectId, {
        name: title,
        description,
        maxMembers,
      });
      console.log("response", response);

      if (response.error) {
        setError("Error al actualizar el proyecto");
        return;
      }

      if (collaboratorsEmails.length > 0) {
        const responseInvitacion = await usersRoomsApi.sendInvitation({
          code: project.code,
          name: project.name,
          emails: collaboratorsEmails,
        });

        console.log("Response Invitacion", responseInvitacion);

        if (responseInvitacion.error) {
          setError("Error: " + responseInvitacion.error.message);
        }

        toast.success("Invitaciones enviadas correctamente!");
      }
      toast.success("Proyecto actualizado correctamente!");
      router.push(APP_ROUTES.DASHBOARD.PROJECT.ROOT(project!.idRoom));
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);
      setError("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isCreator()) {
    return (
      <AccessDenied
        message='Solo el creador puede editar este proyecto'
        handleOnClick={() => router.back()}
      />
    );
  }

  return (
    <div className='mx-auto max-w-2xl pt-10'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Editar proyecto</h1>
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
          {collaboratorsEmails.length > 0 && (
            <div className='ml-6 space-x-2'>
              <CardTitle>Colaboradores invitados:</CardTitle>
              <ul className='space-y-1'>
                {collaboratorsEmails.map((email) => (
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

          {/* Información de código */}
          <div className='rounded-md bg-blue-50 p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-blue-400'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3 flex-1'>
                <h3 className='text-sm font-medium text-blue-800'>
                  Código de invitación
                </h3>
                <p className='mt-2 text-sm text-blue-700'>
                  El código de este proyecto es:{" "}
                  <span className='font-mono font-bold tracking-widest'>
                    {project!.code}
                  </span>
                </p>
                <p className='mt-1 text-sm text-blue-700'>
                  Comparte este código con cualquier persona que desees invitar
                  al proyecto.
                </p>
              </div>
            </div>
          </div>

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
                  Actualizando...
                </>
              ) : (
                "Actualizar proyecto"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
