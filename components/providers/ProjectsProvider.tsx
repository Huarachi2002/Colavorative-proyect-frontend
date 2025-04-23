"use client";

import { projectsApi } from "@/lib/api";
import { createContext, useContext, useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  collaborators: string[];
  createdAt: string;
  updatedAt: string;
};

type ProjectsContextType = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetchProjects: () => Promise<void>;
  deleteProject: (id: string) => Promise<boolean>;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined
);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectsApi.getAll();
      if (response.error) {
        throw new Error(response.error.message);
      }

      setProjects(
        Array.isArray(response.data) ? (response.data as Project[]) : []
      );
    } catch (error: any) {
      setError(error.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectsApi.delete(id);
      if (response.error) {
        throw new Error(response.error.message);
      }

      setProjects((prev) => prev.filter((project) => project.id !== id));
      return true;
    } catch (error: any) {
      setError(error.message || "Error inesperado");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refetchProjects = async () => {
    await fetchProjects();
  };

  useEffect(() => {
    refetchProjects();
  }, []);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        loading,
        error,
        refetchProjects,
        deleteProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectsContext);

  if (context === undefined) {
    throw new Error("useProjects debe usarse dentro de un ProjectsProvider");
  }

  return context;
};
