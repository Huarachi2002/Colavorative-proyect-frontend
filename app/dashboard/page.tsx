"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Clock, ExternalLink, Plus, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Diseno de UI DASHBOARD 1",
    updateAt: "2023-10-01",
    collaborators: 3,
  },
  {
    id: "1",
    name: "Diseno de UI DASHBOARD 2",
    updateAt: "2023-10-01",
    collaborators: 5,
  },
  {
    id: "1",
    name: "Diseno de UI DASHBOARD 3",
    updateAt: "2023-10-01",
    collaborators: 2,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold text-gray-900'>Mis Proyectos</h1>
        <Link
          href='/dashboard/create-project'
          className='bg-primary-blue inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700'
        >
          <Plus className='mr-2 h-4 w-4' />
          Crear Proyecto
        </Link>
      </div>

      <div className='mt-8'>
        {isLoading ? (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='animate-pulse rounded-lg border border-gray-200 bg-white p-6'
              >
                <div className='h-4 w-3/4 rounded bg-gray-200'></div>
                <div className='mt-4 h-3 w-1/2 rounded bg-gray-200'></div>
                <div className='mt-6 h-3 w-1/3 rounded bg-gray-200'></div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {projects.map((project) => (
              <Link
                href={`/dashboard/project/${project.id}`}
                key={project.id}
                className='group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md'
              >
                <h2 className='text-lg font-medium text-gray-900'>
                  {project.name}
                </h2>
                <div className='mt-2 flex items-center text-sm text-gray-500'>
                  <Clock className='mr-1 h-4 w-4' />
                  Actualizado: {new Date(project.updateAt).toLocaleDateString()}
                </div>
                <div className='mt-2 flex items-center text-sm text-gray-500'>
                  <User className='mr-1 h-4 w-4' />
                  {project.collaborators} Colaboradores
                </div>
                <div className='text-primary-blue mt-4 flex items-center text-sm opacity-0 transition-opacity group-hover:opacity-100'>
                  <span>Abrir proyecto</span>
                  <ExternalLink className='ml-1 h-4 w-4' />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className='rounded-lg border-2 border-dashed border-gray-300 p-12 text-center'>
            <h3 className='mt-2 text-sm font-medium text-gray-500'>
              Comienza creando tu primer proyecto colabortivo.
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Comienza creando tu primer proyecto colaborativo.
            </p>
            <div className='mt-6'>
              <Link
                href='/dashboard/create-project'
                className='bg-primary-blue inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700'
              >
                <Plus className='mr-2 h-4 w-4' />
                Crear Proyecto
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
