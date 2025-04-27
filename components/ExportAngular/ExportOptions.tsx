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
}

export function ExportOptions({ projectName, onExport }: ExportOptionsProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: "angular",
    includeAssets: true,
    includeComments: false,
    optimizeForProduction: false,
    angularVersion: "17.0.0",
  });

  const handleChange = (field: keyof ExportOptions, value: any) => {
    setOptions({ ...options, [field]: value });
  };

  const handleExport = () => {
    onExport(options);
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
              <Label htmlFor='angularVersion'>Versión de Angular</Label>
              <select
                id='angularVersion'
                className='mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
                value={options.angularVersion}
                onChange={(e) => handleChange("angularVersion", e.target.value)}
              >
                <option value='17.0.0'>17.0.0 (Actual)</option>
                <option value='16.2.0'>16.2.0</option>
                <option value='15.2.0'>15.2.0</option>
                <option value='14.3.0'>14.3.0</option>
              </select>
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
