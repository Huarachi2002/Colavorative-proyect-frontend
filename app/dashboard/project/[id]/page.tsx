"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Room from "./Room"; // Usa el Room adaptado

// Importa tu App de forma dinámica para evitar problemas con SSR
const ProjectCanvas = dynamic(() => import("./ProjectCanvas"), { ssr: false });

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  return (
    <Room projectId={id as string}>
      <ProjectCanvas projectId={id as string} />
    </Room>
  );
}
