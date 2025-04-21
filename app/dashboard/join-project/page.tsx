"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_ROUTES } from "@/lib/routes";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function JoinProjectPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const normalizedCode = code.trim().toUpperCase();

      if (normalizedCode.length < 6) {
        setError("El código del proyecto debe tener 6 caracteres.");
        return;
      }

      //TODO: Aquí se realizaría una llamada a la API para verificar el código
      // GET: /api/projects/validate-code/{code}

      // Simulación con localStorage
      const projects = JSON.parse(localStorage.getItem("projects") || "[]");
      const projectFound = projects.find(
        (project: any) => project.code === normalizedCode
      );

      console.log("Project found:", projectFound);

      if (!projectFound) {
        setError("El código del proyecto no es válido.");
        setIsLoading(false);
        return;
      }

      router.push(`${APP_ROUTES.DASHBOARD.PROJECT.ROOT(projectFound.id)}`);
    } catch (error) {
      console.error("Error al unirse al proyecto:", error);
      setError("Ocurrió un error al unirse al proyecto. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='mx-auto max-w-md p-6'>
      <h1 className='mb-6 text-2xl font-semibold'>Unirse a un proyecto</h1>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <Label
            htmlFor='code'
            className='block text-sm font-medium text-gray-700'
          >
            Ingrese el codigo de invitacion
          </Label>

          <Input
            id='code'
            type='text'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading}
            className={error ? "border-red-500" : ""}
          />
          {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
        </div>
        <div className='flex justify-end'>
          <Button
            type='submit'
            disabled={isLoading || code.length < 6}
            className='w-full bg-blue-400 text-white hover:bg-blue-500'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verificando...
              </>
            ) : (
              "Unirse al proyecto"
            )}
          </Button>
        </div>
      </form>

      <div className='mt-8'>
        <p className='text-sm text-gray-500'>
          El codigo de invitacion debe haber sido compartido por el creador del
          proyecto.
          <br />
          Si no tiene un codigo, puede solicitar uno o crear su propio proyecto.
        </p>
      </div>
    </div>
  );
}
