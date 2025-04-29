"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ExportOptionsProps {
  projectName: string;
  onExport: (options: ExportOptions) => void;
}

interface ExportOptions {
  format: "angular";
  includeAssets: boolean;
  includeComments: boolean;
  optimizeForProduction: boolean;
  angularVersion: string;
  options: {
    name: string;
    version: string;
    includeRouting: boolean;
    responsiveLayout: boolean;
    cssFramework: string;
    generateComponents: boolean;
  };
}

export function ExportOptions({ projectName, onExport }: ExportOptionsProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: "angular",
    includeAssets: true,
    includeComments: false,
    optimizeForProduction: false,
    angularVersion: "17.0.0",
    options: {
      name: projectName || "angular-project", // Usar el nombre del proyecto
      version: "17.0.0", // Valor inicial igual a angularVersion
      includeRouting: true,
      responsiveLayout: true,
      cssFramework: "bootstrap", // Opciones: bootstrap, material, none
      generateComponents: true,
    },
  });

  const handleChange = (field: keyof ExportOptions, value: any) => {
    setOptions({ ...options, [field]: value });
  };

  // Nueva función para manejar cambios en los campos anidados de options
  const handleOptionsChange = (field: string, value: any) => {
    setOptions({
      ...options,
      options: {
        ...options.options,
        [field]: value,
      },
    });
  };

  // Actualizar la versión de Angular en ambos lugares cuando cambia
  const handleVersionChange = (version: string) => {
    setOptions({
      ...options,
      angularVersion: version,
      options: {
        ...options.options,
        version: version,
      },
    });
  };

  const handleExport = () => {
    // Asegurar que los valores estén actualizados antes de exportar
    const exportOptions = {
      ...options,
      options: {
        ...options.options,
        version: options.angularVersion, // Asegurar que la versión esté sincronizada
      },
    };
    onExport(exportOptions);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Exportar proyecto a Angular</h3>
        <p className='text-sm text-gray-500'>
          Configura las opciones para exportar ({projectName}) como un proyecto
          Angular
        </p>
      </div>

      <Tabs defaultValue='general' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='general'>General</TabsTrigger>
          <TabsTrigger value='advanced'>Avanzado</TabsTrigger>
        </TabsList>
        <TabsContent value='general' className='space-y-4 pt-4'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='includeAssets'
                checked={options.includeAssets}
                onCheckedChange={(checked) =>
                  handleChange("includeAssets", checked === true)
                }
              />
              <Label htmlFor='includeAssets'>Incluir recursos gráficos</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='includeComments'
                checked={options.includeComments}
                onCheckedChange={(checked) =>
                  handleChange("includeComments", checked === true)
                }
              />
              <Label htmlFor='includeComments'>Incluir comentarios</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='advanced' className='space-y-4 pt-4'>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='cssFramework'>Framework CSS</Label>
              <select
                id='cssFramework'
                className='mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
                value={options.options.cssFramework}
                onChange={(e) =>
                  handleOptionsChange("cssFramework", e.target.value)
                }
              >
                <option value='bootstrap'>Bootstrap</option>
                <option value='material'>Angular Material</option>
                <option value='none'>Ninguno</option>
              </select>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='includeRouting'
                checked={options.options.includeRouting}
                onCheckedChange={(checked) =>
                  handleOptionsChange("includeRouting", checked === true)
                }
              />
              <Label htmlFor='includeRouting'>Incluir módulo de rutas</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='responsiveLayout'
                checked={options.options.responsiveLayout}
                onCheckedChange={(checked) =>
                  handleOptionsChange("responsiveLayout", checked === true)
                }
              />
              <Label htmlFor='responsiveLayout'>Usar diseño responsive</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='generateComponents'
                checked={options.options.generateComponents}
                onCheckedChange={(checked) =>
                  handleOptionsChange("generateComponents", checked === true)
                }
              />
              <Label htmlFor='generateComponents'>
                Generar componentes del canvas
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='optimizeForProduction'
                checked={options.optimizeForProduction}
                onCheckedChange={(checked) =>
                  handleChange("optimizeForProduction", checked === true)
                }
              />
              <Label htmlFor='optimizeForProduction'>
                Optimizar para producción
              </Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className='flex justify-end pt-4'>
        <Button
          onClick={handleExport}
          className='bg-blue-400 text-white hover:bg-blue-500'
        >
          Exportar proyecto
        </Button>
      </div>
    </div>
  );
}
