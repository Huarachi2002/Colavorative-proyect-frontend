"use client";

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Room from "./Room";
import { useEffect, useState } from "react";
import { usersRoomsApi } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import AccessDenied from "@/components/AccessDenied";

// Importa tu App de forma dinámica para evitar problemas con SSR
const ProjectCanvas = dynamic(() => import("./ProjectCanvas"), { ssr: false });

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [access, setAccess] = useState<boolean>(true);
  // Extraer id como string, con manejo de casos donde podría ser un array
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  // Verificar si el usuario no esta BLOCKED de la sala
  useEffect(() => {
    const fetchUserRoom = async () => {
      try {
        const response = await usersRoomsApi.validateJoinProject(
          projectId,
          user!.id
        );
        console.log("Response validateJoinProject:", response);
        if (response.error) {
          console.error("Error al validar el proyecto:", response.error);
          return;
        }

        if (!response.data.data) {
          setAccess(false);
        }
      } catch (error) {
        console.error("Error al validar el proyecto:", error);
      }
    };

    fetchUserRoom();
  });

  if (!access) {
    return (
      <AccessDenied
        message='No tienes acceso a este proyecto'
        handleOnClick={() => router.back()}
      />
    );
  }

  return (
    <div className='h-full'>
      <Room projectId={projectId}>
        <ProjectCanvas />
      </Room>
    </div>
  );
}
