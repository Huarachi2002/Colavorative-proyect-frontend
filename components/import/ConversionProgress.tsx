"use client";

import { Progress } from "../ui/progress";

interface ConversionProgressProps {
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
}

export function ConversionProgress({
  status,
  progress,
}: ConversionProgressProps) {
  const getStatusMessage = () => {
    switch (status) {
      case "uploading":
        return "Subiendo boceto...";
      case "processing":
        return "Procesando boceto...";
      case "completed":
        return "Conversión completada!";
      case "error":
        return "Error en la conversión.";
      default:
        return "";
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium'>{getStatusMessage()}</span>
        <span className='text-sm font-medium'>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />

      {status === "processing" && (
        <div className='mt-2 text-sm text-gray-500'>
          <p>Estamos analizando tu boceto para convertirlo en un proyecto</p>
          <p>Este proceso puede tomar unos momentos, por favor espera...</p>
        </div>
      )}
    </div>
  );
}
