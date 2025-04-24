import { Button } from "./ui/button";
import { AccessDeniedProps } from "@/types/type";

export default function AccessDenied({
  message,
  handleOnClick,
}: AccessDeniedProps) {
  return (
    <div className='flex h-full items-center justify-center pt-6'>
      <div className='text-center'>
        <h2 className='text-xl font-medium text-gray-900'>Acceso denegado</h2>
        <p className='mt-2 text-gray-600'>
          {/* Solo el creador puede editar este proyecto */}
          {message}
        </p>
        <Button
          onClick={handleOnClick}
          className='w-full bg-blue-300 text-white hover:bg-blue-400'
        >
          Volver
        </Button>
      </div>
    </div>
  );
}
