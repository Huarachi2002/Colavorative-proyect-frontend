"use client";

import { exportApi } from "@/lib/api";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ExportOptions } from "./ExportOptions";
import { ExportProgress } from "./ExportProgress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface ExportDialogProps {
  projectId: string;
  projectName: string;
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
}

export function ExportDialog({
  projectId,
  projectName,
  fabricRef,
}: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<string>("");

  // Función avanzada para comprimir la imagen más agresivamente
  const compressImage = (
    dataUrl: string,
    quality: number = 0.6,
    maxDimension = 1200
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción si es necesario
        let newWidth = img.width;
        let newHeight = img.height;

        if (Math.max(newWidth, newHeight) > maxDimension) {
          if (newWidth > newHeight) {
            newHeight = Math.round((newHeight * maxDimension) / newWidth);
            newWidth = maxDimension;
          } else {
            newWidth = Math.round((newWidth * maxDimension) / newHeight);
            newHeight = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        // Usar formato JPEG para mejor compresión (menor tamaño que PNG)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        const originalSize = Math.round(dataUrl.length / 1024);
        const compressedSize = Math.round(compressedDataUrl.length / 1024);
        console.log(
          `Image compressed from ${originalSize}KB to ${compressedSize}KB (${Math.round(
            (compressedSize / originalSize) * 100
          )}% of original)`
        );
        resolve(compressedDataUrl);
      };
    });
  };

  const handleExport = async (options: any) => {
    if (!fabricRef.current || isExporting) return;
    console.log("======= Exporting with options:", options);
    try {
      setIsExporting(true);
      setProgress(10);
      setStep("Preparando captura del canvas...");

      // Capturar el canvas como una imagen base64 y comprimir
      const originalCanvas = fabricRef.current.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1, // Reducido para menor tamaño
      });

      // Comprimir la imagen usando un canvas temporal
      const compressedImage = await compressImage(originalCanvas, 0.6);
      console.log("Canvas image compressed and generated (base64)");

      setProgress(30);
      setStep("Enviando imagen al servidor...");

      // Preparar datos para el backend según la estructura esperada por CreateAngularDto
      const requestData = {
        projectId,
        projectName,
        canvasImage: compressedImage,
        options: {
          name: options.options.name || projectName,
          version: options.options.version || options.angularVersion,
          includeRouting: options.options.includeRouting || false,
          responsiveLayout: options.options.responsiveLayout || false,
          cssFramework: options.options.cssFramework || "none",
          generateComponents: options.options.generateComponents || false,
        },
      };

      // Usaremos fetch directamente para tener más control sobre la respuesta
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL + "/export/angular";
      console.log("API URL:", apiUrl);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      console.log("Response from server:", response);

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", response.status, errorText);
        throw new Error(
          `Error en la respuesta del servidor: ${response.status} - ${errorText}`
        );
      }

      setProgress(60);
      setStep("Generando proyecto Angular...");

      // Obtener el contenido como blob (archivo binario) con el tipo MIME correcto
      const blobData = await response.blob();

      setProgress(90);
      setStep("Preparando descarga...");

      // Crear URL para descarga
      const url = window.URL.createObjectURL(
        new Blob([blobData], { type: "application/zip" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}-angular-project.zip`;

      // Trigger la descarga
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setProgress(100);
      setStep("¡Exportación completada!");

      toast.success("¡Proyecto Angular exportado con éxito!");
    } catch (error) {
      console.error("Error en exportación:", error);
      toast.error(
        `Error: ${error.message || "Error desconocido en la exportación"}`
      );
    } finally {
      // Restablecer el estado después de un breve retraso para ver el 100%
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
        setStep("");
      }, 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Download size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className='bg-white sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>

        {isExporting ? (
          <ExportProgress progress={progress} step={step} />
        ) : (
          <ExportOptions projectName={projectName} onExport={handleExport} />
        )}
      </DialogContent>
    </Dialog>
  );
}
