import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

interface LibraryTabProps {
  active: boolean;
  onClick: () => void;
}

export function LibraryTab({ active, onClick }: LibraryTabProps) {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      size='sm'
      className='w-full justify-start px-2 py-1.5'
      onClick={onClick}
    >
      <Database className='mr-2 h-4 w-4' />
      <span>Componentes</span>
    </Button>
  );
}
