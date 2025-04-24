"use client";

import { ImportForm } from "@/components/import/ImportForm";
import { Button } from "@/components/ui/button";
import { importApi } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fabric } from "fabric";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConversionProgress } from "@/components/import/ConversionProgress";
import { CustomFabricObject } from "@/types/type";
import { v4 as uuidv4 } from "uuid";

type ImportStatus = "idle" | "uploading" | "processing" | "completed" | "error";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [importedObjects, setImportedObjects] = useState<any[]>([]);
  const router = useRouter();

  // Canvas de previsualización con Fabric.js
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#f0f0f0",
    });

    previewCanvasRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, []);

  // Función para manejar la selección de archivo
  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);

    // Crear URL para previsualización
    const fileUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(fileUrl);

    setStatus("idle");
    setProgress(0);

    // Limpiar el canvas
    if (previewCanvasRef.current) {
      previewCanvasRef.current.clear();
    }
  };

  // Función para procesar el boceto
  const handleProcessSketch = async () => {
    if (!file || !previewCanvasRef.current) return;

    try {
      setStatus("uploading");
      setProgress(10);

      const formData = new FormData();
      formData.append("sketch", file);

      // TODO: ImportApi
      const response = await importApi.processSketch(
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
      setProgress(80);

      console.log("Import response:", response);

      // Tomamos los elementos detectados por la IA
      const elements = response.data.data.elements;

      // Guardamos los objetos para uso posterior
      setImportedObjects(elements);
      setProgress(90);

      // Limpiar el canvas y añadir los objetos
      const canvas = previewCanvasRef.current;
      canvas.clear();

      const fabricElementsPromises = elements.map((element: any) =>
        convertToFabricObject(element)
      );

      console.log("Fabric elements promises:", fabricElementsPromises);

      const fabricElements = await Promise.all(fabricElementsPromises);

      console.log("Fabric elements:", fabricElements);

      fabricElements.forEach((obj: any) => {
        if (obj) {
          canvas.add(obj);
        }
      });

      canvas.renderAll();
      setProgress(100);
      setStatus("completed");
      toast.success("Boceto importado exitosamente!");
    } catch (error) {
      console.error("Error importing file:", error);
      setStatus("error");
      toast.error(
        "Error al importar el boceto: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  // Función para convertir un elemento de la respuesta API a un objeto Fabric.js
  const convertToFabricObject = async (
    element: any
  ): Promise<fabric.Object | null> => {
    try {
      if (!element.objectId) {
        element.objectId = uuidv4();
      }

      switch (element.type) {
        case "rectangle":
          return new fabric.Rect({
            left: element.left,
            top: element.top,
            width: element.width || 100,
            height: element.height || 100,
            fill: element.fill || "#aabbcc",
            objectId: element.objectId,
          } as CustomFabricObject<fabric.Rect>);

        case "triangle":
          return new fabric.Triangle({
            left: element.left,
            top: element.top,
            width: element.width || 100,
            height: element.height || 100,
            fill: element.fill || "#aabbcc",
            objectId: element.objectId,
          } as CustomFabricObject<fabric.Triangle>);
        case "circle":
          return new fabric.Circle({
            left: element.left,
            top: element.top,
            radius: element.radius || 50,
            fill: element.fill || "#aabbcc",
            objectId: element.objectId,
          } as any);

        case "line":
          if (Array.isArray(element.points) && element.points.length === 4) {
            return new fabric.Line(element.points, {
              stroke: element.stroke || "#aabbcc",
              strokeWidth: element.strokeWidth || 2,
              objectId: element.objectId,
            } as CustomFabricObject<fabric.Line>);
          } else {
            return new fabric.Line(
              [
                element.x1 || element.left || 0,
                element.y1 || element.top || 0,
                element.x2 || element.left + 100 || 100,
                element.y2 || element.top || 0,
              ],
              {
                stroke: element.stroke || "#aabbcc",
                strokeWidth: element.strokeWidth || 2,
                objectId: element.objectId,
              } as CustomFabricObject<fabric.Line>
            );
          }

        case "text":
          return new fabric.IText(element.text || "Texto", {
            left: element.left,
            top: element.top,
            fill: element.fill || "#000000",
            fontFamily: element.fontFamily || "Helvetica",
            fontSize: element.fontSize || 36,
            fontWeight: element.fontWeight || "400",
            objectId: element.objectId,
          } as fabric.ITextOptions);

        case "path":
          // Si la IA detectó un dibujo a mano alzada
          if (element.path) {
            return new fabric.Path(element.path, {
              fill: element.fill || "#000000",
              stroke: element.stroke || "#000",
              strokeWidth: element.strokeWidth || 2,
              objectId: element.objectId,
            } as CustomFabricObject<fabric.Path>);
          }
          return null;

        default:
          console.warn(`Tipo de elemento no soportado: ${element.type}`);
          return null;
      }
    } catch (error) {
      console.error(`Error al convertir elemento ${element.type}:`, error);
      return null;
    }
  };

  const handleCreateProject = async () => {
    try {
      if (importedObjects.length > 0) {
        console.log("Objetos a importar:", importedObjects);
        localStorage.setItem(
          "importedSketchObjects",
          JSON.stringify(importedObjects)
        );

        router.push(APP_ROUTES.DASHBOARD.CREATE_PROJECT);
        toast.success("Objetos importados listos para el nuevo proyecto");
      } else {
        toast.error("No hay objetos para crear el proyecto.");
      }
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

      <Tabs defaultValue='upload' className='w-full'>
        <TabsList className='mb-8 grid w-full grid-cols-2'>
          <TabsTrigger value='upload'>Subir Boceto</TabsTrigger>
          <TabsTrigger
            value='about'
            disabled={status === "uploading" || status === "processing"}
          >
            Información
          </TabsTrigger>
        </TabsList>

        <TabsContent value='upload'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Subir Boceto</CardTitle>
                  <CardDescription>
                    Sube una imagen de tu boceto para convertirlo en un proyecto
                    editable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImportForm onFileChange={handleFileChange} />

                  {(status === "uploading" || status === "processing") && (
                    <div className='mt-6'>
                      <ConversionProgress status={status} progress={progress} />
                    </div>
                  )}

                  {/* {previewUrl && status === "idle" && ( */}
                  {previewUrl && (
                    <div className='mt-4'>
                      <h3 className='mb-2 text-lg font-medium'>
                        Vista previa de la imagen
                      </h3>
                      <div className='overflow-hidden rounded-lg border'>
                        <img
                          src={previewUrl}
                          alt='Vista previa del boceto'
                          className='h-auto w-full'
                        />
                      </div>
                      {status === "idle" && (
                        <Button
                          onClick={handleProcessSketch}
                          className='mt-4 w-full bg-blue-400 text-white hover:bg-blue-500'
                        >
                          Procesar Boceto
                        </Button>
                      )}
                    </div>
                  )}

                  {status === "error" && (
                    <div className='mt-4 rounded-md border border-red-200 bg-red-50 p-4'>
                      <h3 className='mb-2 text-lg font-medium text-red-600'>
                        Error
                      </h3>
                      <p className='text-red-500'>
                        Ocurrió un error al procesar el boceto. Por favor,
                        intenta con otra imagen.
                      </p>
                      <Button
                        variant='outline'
                        onClick={() => setStatus("idle")}
                        className='mt-2'
                      >
                        Volver a Intentar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resultado</CardTitle>
                  <CardDescription>
                    {status === "completed"
                      ? "Boceto procesado y convertido a objetos editables"
                      : "Aquí aparecerá el resultado procesado"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='overflow-hidden rounded-lg border bg-white'>
                    <canvas ref={canvasRef} className='h-[400px] w-full' />
                  </div>
                </CardContent>

                {status === "completed" && importedObjects.length > 0 && (
                  <CardFooter className='flex justify-between'>
                    <Button
                      onClick={handleProcessSketch}
                      className='w-max bg-yellow-400 text-white hover:bg-yellow-500'
                    >
                      Reimaginar boceto
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      className='w-max bg-green-400 text-white hover:bg-green-500'
                    >
                      Crear nuevo proyecto con este boceto
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='about'>
          <Card>
            <CardHeader>
              <CardTitle>Sobre la importación de bocetos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='mb-4'>
                Esta funcionalidad te permite convertir tus bocetos a mano en
                proyectos editables dentro de la plataforma.
              </p>
              <h3 className='mb-2 text-lg font-semibold'>Cómo funciona:</h3>
              <ol className='mb-4 list-inside list-decimal space-y-2'>
                <li>
                  Sube una imagen clara de tu boceto (formatos JPG, PNG o GIF)
                </li>
                <li>
                  Nuestro sistema de IA analizará la imagen y detectará los
                  elementos
                </li>
                <li>
                  Los elementos detectados se convertirán en objetos editables
                </li>
                <li>Podrás crear un nuevo proyecto con estos elementos</li>
              </ol>
              <h3 className='mb-2 text-lg font-semibold'>Recomendaciones:</h3>
              <ul className='list-inside list-disc space-y-2'>
                <li>Usa imágenes claras y con buen contraste</li>
                <li>Dibujos simples funcionan mejor</li>
                <li>Intenta que los elementos estén bien separados</li>
                <li>Incluye texto legible si es necesario</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
