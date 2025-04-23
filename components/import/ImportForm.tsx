"use client";

import { cn } from "@/lib/utils";
import { ChangeEvent, useRef, useState } from "react";
import { Input } from "../ui/input";

interface ImportFormProps {
  onFileChange: (file: File) => void;
}

export function ImportForm({ onFileChange }: ImportFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, sube un archivo de imagen.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(
        "El archivo es demasiado grande. El tamaño máximo permitido es de 5MB."
      );
      return;
    }

    onFileChange(file);
  };

  return (
    <div>
      <div
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors",
          isDragging ? "border-blue-500 bg-blue-50" : "hover:bg-gray-400"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className='flex flex-col items-center justify-center space-y-2'>
          <svg
            className={cn(
              "h-12 w-12",
              isDragging ? "text-blue-500" : "text-gray-400"
            )}
            stroke='currentColor'
            fill='none'
            viewBox='0 0 48 48'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
            />
          </svg>
          <div className='text-sm text-gray-500'>
            <span className='font-medium'>Haz clic para seleccionar</span> o
            arrastra y suelta
          </div>
          <p className='text-xs text-gray-500'>PNG, JPG, GIF hasta 5MB</p>
        </div>
      </div>
      <Input
        type='file'
        ref={fileInputRef}
        onChange={handleFileInput}
        accept='image/*'
        className='hidden'
      />
    </div>
  );
}
