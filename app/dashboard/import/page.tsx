"use client";

import { ImportForm } from "@/components/import/ImportForm";
import { ResultPreview } from "@/components/import/ResultPreview";
import { SketchPreview } from "@/components/import/SketchPreview";
import { Button } from "@/components/ui/button";
import { importApi, projectsApi } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type ImportStatus = "idle" | "uploading" | "processing" | "completed" | "error";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);

    const fileUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(fileUrl);

    setStatus("idle");
    setProgress(0);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setStatus("uploading");
      setProgress(10);

      const formData = new FormData();
      formData.append("sketch", file);

      // TODO: ImportApi
      const response = await importApi.importFromSketch(
        formData,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(10 + percentCompleted * 0.4);
        }
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      setStatus("processing");

      // Simular progreso durante el procesamiento de IA (el backend enviará actualizaciones reales)
      const processingInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 95) {
            clearInterval(processingInterval);
            return 95;
          }
          return newProgress;
        });
      }, 1000);

      // Esperar a que el backend procese la imagen
      const resultResponse = await importApi.getImportResult(
        response.data.importId
      );

      clearInterval(processingInterval);

      if (resultResponse.error) {
        throw new Error(resultResponse.error.message);
      }

      setResult(resultResponse.data);
      setProgress(100);
      setStatus("completed");
    } catch (error) {
      console.error("Error importing file:", error);
      setStatus("error");
      toast.error(
        "Error al importar el boceto: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  const handleCreateProject = async () => {
    if (!result) return;

    try {
      const response = await projectsApi.createFromSketch({
        name: "Projecto Importado",
        description: "Proyecto creado a partir de un boceto",
        elements: result.elements,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Proyecto creado exitosamente!");
      router.push(
        APP_ROUTES.DASHBOARD.PROJECT.ROOT(response.data.data.room.idRoom)
      );
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(
        "Error al crear el proyecto :" +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  return (
    <div className='container py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Importar Proyecto</h1>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <div className='space-y-6'>
          <div className='rounded-lg bg-white p-6 shadow'>
            <h2 className='mb-4 text-xl font-semibold'>Subir Boceto</h2>
            <ImportForm onFileChange={handleFileChange} />

            {previewUrl && (
              <div className='mt-4'>
                <h3 className='mb-2 text-lg font-medium'>Vista Previa</h3>
                <SketchPreview imageUrl={previewUrl} />

                <Button
                  onClick={handleImport}
                  className='blue-400 mt-4 w-full text-white hover:bg-blue-500'
                  disabled={status === "uploading" || status === "processing"}
                >
                  {status === "idle" ? "Procesar Boceto" : "Procesando..."}
                </Button>
              </div>
            )}
          </div>

          {(status === "uploading" || status === "processing") && (
            <div className='rounded-lg bg-white p-6 shadow'>
              <h2 className='mb-4 text-xl font-semibold'>Resultado</h2>
              <ResultPreview result={result} />

              <div className='mt-6 flex flex-col gap-2'>
                <Button
                  onClick={handleCreateProject}
                  className='bg-green-400 text-white hover:bg-green-500'
                >
                  Crear Proyecto
                </Button>

                <Button
                  variant='outline'
                  onClick={() => setStatus("idle")}
                  className='bg-yellow-400 text-white hover:bg-yellow-500'
                >
                  Volver a Subir
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className='rounded-lg bg-white p-6 shadow'>
              <h2 className='mb-4 text-xl font-semibold text-red-600'>Error</h2>
              <p>
                Ha ocurrido un error al procesar el boceto. Por favor, intena
                con otra imagen
              </p>
              <Button
                variant='outline'
                onClick={() => setStatus("idle")}
                className='mt-4 bg-yellow-400 text-white hover:bg-yellow-500'
              >
                Volver a Intentar
              </Button>
            </div>
          )}
        </div>

        <div>
          {status === "completed" && (
            <div className='rounded-lg bg-white p-6 shadow'>
              <h2>Progreso</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
