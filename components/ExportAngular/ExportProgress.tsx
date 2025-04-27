"use client";

import { Progress } from "@/components/ui/progress";

interface ExportProgressProps {
  progress: number;
  step: string;
}

export function ExportProgress({ progress, step }: ExportProgressProps) {
  return (
    <div className='space-y-6 py-8'>
      <div className='text-center'>
        <h3 className='mb-2 text-lg font-semibold'>
          Exportando proyecto Angular
        </h3>
        <p className='mb-6 text-sm text-muted-foreground'>
          Este proceso puede tardar unos momentos...
        </p>
      </div>

      <Progress value={progress} className='w-full' />

      <div className='text-center text-sm'>
        <p className='font-medium'>{step}</p>
        <p className='mt-1 text-muted-foreground'>{progress}% completado</p>
      </div>
    </div>
  );
}
