import { GraphicComponent } from "./LibraryPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ComponentGridProps {
  components: GraphicComponent[];
  isLoading: boolean;
  onSelectComponent: (component: GraphicComponent) => void;
}

export default function ComponentGrid({
  components,
  isLoading,
  onSelectComponent,
}: ComponentGridProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-4 p-4 md:grid-cols-3'>
        {Array.from({ length: 9 }).map((_, i) => (
          <Card
            key={i}
            className='cursor-default overflow-hidden border border-gray-200'
          >
            <CardContent className='p-0'>
              <div className='flex flex-col items-center p-4'>
                <Skeleton className='mb-3 h-20 w-20 rounded-md' />
                <Skeleton className='mb-1 h-4 w-24' />
                <Skeleton className='h-3 w-16' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className='flex h-full items-center justify-center p-8 text-center text-muted-foreground'>
        <div>
          <p className='mb-1 font-medium'>No se encontraron componentes</p>
          <p className='text-sm text-gray-500'>
            Prueba otra categoría o término de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 gap-4 p-4 md:grid-cols-3'>
      {components.map((component) => (
        <Card
          key={component.id}
          className='cursor-pointer overflow-hidden border border-gray-200 transition-all hover:scale-[1.02] hover:border-blue-300 hover:shadow-md'
          onClick={() => onSelectComponent(component)}
        >
          <CardContent className='p-0'>
            <div className='flex flex-col items-center p-4'>
              <div
                className={cn(
                  "mb-3 flex h-20 w-20 items-center justify-center rounded-md",
                  component.type === "ui"
                    ? "bg-blue-50"
                    : component.type === "icon"
                      ? "bg-amber-50"
                      : component.type === "svg"
                        ? "bg-green-50"
                        : component.type === "widget"
                          ? "bg-purple-50"
                          : "bg-gray-100"
                )}
              >
                {component.preview &&
                component.preview !== "data:image/svg+xml;base64,..." &&
                component.preview !== "data:image/png;base64,..." ? (
                  <img
                    src={component.preview}
                    alt={component.name}
                    className='max-h-full max-w-full object-contain'
                  />
                ) : (
                  <PreviewFallback type={component.type} />
                )}
              </div>
              <p className='max-w-full truncate text-sm font-medium'>
                {component.name}
              </p>
              <span className='mt-1 text-xs text-gray-500'>
                {getTypeLabel(component.type)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Componente para mostrar un placeholder cuando no hay imagen de vista previa
function PreviewFallback({ type }: { type: string }) {
  switch (type) {
    case "icon":
      return (
        <div className='flex h-10 w-10 items-center justify-center rounded-sm bg-amber-200 text-amber-700'>
          Icon
        </div>
      );
    case "ui":
      return (
        <div className='flex h-12 w-16 items-center justify-center rounded-sm bg-blue-200 text-blue-700'>
          UI
        </div>
      );
    case "svg":
      return (
        <div className='flex h-10 w-10 items-center justify-center rounded-sm bg-green-200 text-green-700'>
          SVG
        </div>
      );
    case "widget":
      return (
        <div className='flex h-12 w-14 items-center justify-center rounded-sm bg-purple-200 text-purple-700'>
          Widget
        </div>
      );
    default:
      return (
        <div className='flex h-10 w-10 items-center justify-center rounded-sm bg-gray-200 text-gray-700'>
          ?
        </div>
      );
  }
}

// Función para obtener una etiqueta del tipo de componente
function getTypeLabel(type: string): string {
  switch (type) {
    case "icon":
      return "Ícono";
    case "ui":
      return "Elemento UI";
    case "svg":
      return "Vector SVG";
    case "widget":
      return "Widget Interactivo";
    default:
      return type;
  }
}
