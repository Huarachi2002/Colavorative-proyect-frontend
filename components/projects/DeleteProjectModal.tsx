"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface DeleteProjectModalProps {
  isOpen: boolean;
  projectTitle: string;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export default function DeleteProjectModal({
  isOpen,
  projectTitle,
  onClose,
  onConfirmDelete,
}: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setError("");
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== projectTitle) {
      setError("El texto no coincide con el nombre del proyecto");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await onConfirmDelete();
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Error al eliminar el proyecto. Por favor intenta de nuevo.");
      setIsDeleting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center'>
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className='relative inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle'>
          <div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
                <AlertTriangle
                  className='h-6 w-6 text-red-600'
                  aria-hidden='true'
                />
              </div>
              <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
                <h3 className='text-lg font-medium leading-6 text-gray-900'>
                  Eliminar proyecto
                </h3>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>
                    Esta acción no se puede deshacer. Se eliminará
                    permanentemente el proyecto (<strong>{projectTitle}</strong>
                    ) y todos sus datos, incluyendo la colaboración en tiempo
                    real.
                  </p>
                  <div className='mt-4'>
                    <Label
                      htmlFor='confirm-delete'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Para confirmar, escriba el nombre del proyecto:
                    </Label>
                    <Input
                      type='text'
                      id='confirm-delete'
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none sm:text-sm'
                      placeholder={projectTitle}
                    />
                  </div>
                  {error && (
                    <p className='mt-2 text-sm text-red-600'>{error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
            <Button
              type='button'
              disabled={isDeleting || confirmText !== projectTitle}
              onClick={handleDelete}
              className='inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm'
            >
              {isDeleting ? "Eliminando..." : "Eliminar proyecto"}
            </Button>
            <Button
              type='button'
              onClick={onClose}
              className='mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm'
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
