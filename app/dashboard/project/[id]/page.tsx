"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Room from "./Room";

// Importa tu App de forma dinámica para evitar problemas con SSR
const ProjectCanvas = dynamic(() => import("./ProjectCanvas"), { ssr: false });

export default function ProjectPage() {
  const params = useParams();
  // Extraer id como string, con manejo de casos donde podría ser un array
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  return (
    <div className='h-full'>
      <Room projectId={projectId}>
        <ProjectCanvas />
      </Room>
    </div>
  );
}
