"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useStorage, useMutation } from "@/liveblocks.config";
import CategoryList from "./CategoryList";
import ComponentGrid from "./ComponentGrid";
import { fabric } from "fabric";

// Tipos de componentes
export type GraphicComponent = {
  id: string;
  name: string;
  category: string;
  type: "icon" | "ui" | "svg" | "widget";
  preview: string; // URL o base64 de la imagen de vista previa
  data: any; // Datos para crear el objeto en Fabric.js
};

// Categorías de componentes
const categories = [
  { id: "basic", name: "Básicos", icon: "Square" },
  { id: "icons", name: "Iconos", icon: "StarIcon" },
  { id: "ui", name: "UI Elements", icon: "Layout" },
  { id: "custom", name: "Personal...", icon: "Palette" },
];

interface LibraryPanelProps {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  syncShapeInStorage: (object: fabric.Object) => void;
}

export default function LibraryPanel({
  fabricRef,
  syncShapeInStorage,
}: LibraryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("basic");
  const [components, setComponents] = useState<GraphicComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar componentes gráficos al inicializar
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setIsLoading(true);
        // En producción, esto sería una llamada a tu API
        const response = await fetch("/api/graphic-components");
        const data = await response.json();
        setComponents(data.components || []);
      } catch (error) {
        console.error("Error cargando componentes gráficos:", error);
        // Cargar algunos componentes de ejemplo como fallback
        setComponents(getExampleComponents());
      } finally {
        setIsLoading(false);
      }
    };

    loadComponents();
  }, []);

  // Filtrar componentes según búsqueda y categoría
  const filteredComponents = components.filter(
    (component) =>
      (selectedCategory === "all" || component.category === selectedCategory) &&
      (searchTerm === "" ||
        component.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Función para añadir un componente al canvas
  const addComponentToCanvas = (component: GraphicComponent) => {
    if (!fabricRef.current) return;

    try {
      // Crear objeto según tipo de componente
      let fabricObject: fabric.Object | null = null;

      switch (component.type) {
        case "svg":
          // Cargar SVG
          fabric.loadSVGFromString(component.data.svg, (objects, options) => {
            const svgGroup = fabric.util.groupSVGElements(objects, options);
            svgGroup.set({
              left: 100,
              top: 100,
              scaleX: component.data.scale || 1,
              scaleY: component.data.scale || 1,
              objectId: `obj-${Date.now()}`,
            });

            // Centrar en el canvas
            const canvasCenter = fabricRef.current?.getCenter();
            if (canvasCenter) {
              svgGroup.setPositionByOrigin(
                new fabric.Point(canvasCenter.left, canvasCenter.top),
                "center",
                "center"
              );
            }

            fabricRef.current?.add(svgGroup);
            fabricRef.current?.setActiveObject(svgGroup);
            fabricRef.current?.renderAll();
            syncShapeInStorage(svgGroup);
          });
          break;

        case "icon":
          // Crear un Path para iconos
          fabricObject = new fabric.Path(component.data.path, {
            left: 100,
            top: 100,
            width: component.data.width || 50,
            height: component.data.height || 50,
            fill: component.data.fill || "#aabbcc",
            stroke: component.data.stroke || "",
            strokeWidth: component.data.strokeWidth || 0,
            objectId: `obj-${Date.now()}`,
          });
          break;

        case "ui":
          switch (component.data.element) {
            case "button":
              // Crear un grupo de objetos para un botón
              const rect = new fabric.Rect({
                width: component.data.width || 120,
                height: component.data.height || 40,
                rx: component.data.borderRadius || 4,
                ry: component.data.borderRadius || 4,
                fill: component.data.fill || "#4C7BF4",
                shadow: new fabric.Shadow({
                  color: "rgba(0,0,0,0.2)",
                  blur: 4,
                  offsetX: 0,
                  offsetY: 2,
                }),
              });

              const text = new fabric.Text(component.data.label || "Button", {
                fontSize: component.data.fontSize || 16,
                fill: component.data.textColor || "#FFFFFF",
                fontFamily: component.data.fontFamily || "Arial",
                originX: "center",
                originY: "center",
              });

              const buttonGroup = new fabric.Group([rect], {
                left: 100,
                top: 100,
                objectId: `obj-${Date.now()}`,
              });

              // Centrar el texto dentro del botón
              text.set({
                left: rect.width! / 2,
                top: rect.height! / 2,
              });

              buttonGroup.addWithUpdate(text);
              fabricObject = buttonGroup;
              break;

            case "input":
              // Crear un campo de entrada
              const inputBg = new fabric.Rect({
                width: component.data.width || 200,
                height: component.data.height || 40,
                fill: "#FFFFFF",
                stroke: "#CCCCCC",
                strokeWidth: 1,
                rx: 4,
                ry: 4,
              });

              const placeholder = new fabric.Text(
                component.data.placeholder || "Ingrese texto...",
                {
                  fontSize: 14,
                  fill: "#999999",
                  fontFamily: "Arial",
                  left: 10,
                  top: 12,
                }
              );

              fabricObject = new fabric.Group([inputBg, placeholder], {
                left: 100,
                top: 100,
                objectId: `obj-${Date.now()}`,
              });
              break;

            case "navbar":
              // Crear una barra de navegación
              const navBg = new fabric.Rect({
                width: component.data.width || 800,
                height: component.data.height || 60,
                fill: component.data.fill || "#333333",
              });

              const items = component.data.items || [
                "Home",
                "About",
                "Contact",
              ];
              const navItems: fabric.Text[] = [];

              let currentLeft = 20;
              items.forEach((item) => {
                const navItem = new fabric.Text(item, {
                  left: currentLeft,
                  top: 20,
                  fontSize: 16,
                  fill: "#FFFFFF",
                  fontFamily: "Arial",
                });

                navItems.push(navItem);
                currentLeft += navItem.width! + 30;
              });

              fabricObject = new fabric.Group([navBg, ...navItems], {
                left: 100,
                top: 100,
                objectId: `obj-${Date.now()}`,
              });
              break;
          }
          break;

        case "widget":
          switch (component.data.widget) {
            case "slider":
              // Crear un slider
              const sliderTrack = new fabric.Rect({
                width: component.data.width || 200,
                height: 4,
                fill: "#DDDDDD",
                rx: 2,
                ry: 2,
              });

              const sliderThumb = new fabric.Circle({
                radius: 10,
                fill: "#4C7BF4",
                left:
                  (component.data.value || 0.5) *
                    (component.data.width || 200) -
                  10,
                top: -8,
                shadow: new fabric.Shadow({
                  color: "rgba(0,0,0,0.2)",
                  blur: 3,
                  offsetX: 0,
                  offsetY: 1,
                }),
              });

              fabricObject = new fabric.Group([sliderTrack, sliderThumb], {
                left: 100,
                top: 100,
                objectId: `obj-${Date.now()}`,
              });
              break;

            case "toggle":
              // Crear un toggle switch
              const toggleBg = new fabric.Rect({
                width: 50,
                height: 24,
                rx: 12,
                ry: 12,
                fill: component.data.active ? "#4C7BF4" : "#CCCCCC",
              });

              const toggleCircle = new fabric.Circle({
                radius: 10,
                fill: "#FFFFFF",
                left: component.data.active ? 26 : 4,
                top: 2,
                shadow: new fabric.Shadow({
                  color: "rgba(0,0,0,0.2)",
                  blur: 3,
                  offsetX: 0,
                  offsetY: 1,
                }),
              });

              fabricObject = new fabric.Group([toggleBg, toggleCircle], {
                left: 100,
                top: 100,
                objectId: `obj-${Date.now()}`,
              });
              break;

            case "selector":
              // Crear un selector/dropdown
              const selectorBg = new fabric.Rect({
                width: component.data.width || 200,
                height: component.data.height || 40,
                fill: "#FFFFFF",
                stroke: "#CCCCCC",
                strokeWidth: 1,
                rx: 4,
                ry: 4,
              });

              const selectorText = new fabric.Text(
                component.data.selected || "Seleccionar...",
                {
                  fontSize: 14,
                  fontFamily: "Arial",
                  fill: "#333333",
                  left: 10,
                  top: 12,
                }
              );

              const arrowPath = "M0,0 L10,0 L5,8 z";
              const arrow = new fabric.Path(arrowPath, {
                fill: "#999999",
                left: (component.data.width || 200) - 20,
                top: 16,
              });

              fabricObject = new fabric.Group(
                [selectorBg, selectorText, arrow],
                {
                  left: 100,
                  top: 100,
                  objectId: `obj-${Date.now()}`,
                }
              );
              break;
          }
          break;
      }

      // Añadir el objeto al canvas si se creó correctamente
      if (fabricObject) {
        // Centrar en el canvas
        const canvasCenter = fabricRef.current.getCenter();
        fabricObject.setPositionByOrigin(
          new fabric.Point(canvasCenter.left, canvasCenter.top),
          "center",
          "center"
        );

        fabricRef.current.add(fabricObject);
        fabricRef.current.setActiveObject(fabricObject);
        fabricRef.current.renderAll();
        syncShapeInStorage(fabricObject);
      }
    } catch (error) {
      console.error("Error añadiendo componente al canvas:", error);
    }
  };

  return (
    <div className='flex h-full flex-col bg-primary-black'>
      <div className='border-b p-4'>
        <h2 className='text-lg font-medium'>Biblioteca de Componentes</h2>
        <div className='relative mt-2'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar componentes...'
            className='pl-8'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className='flex flex-1 overflow-hidden'>
        <div className='w-1/3 border-r'>
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className='w-2/3'>
          <ScrollArea className='h-full'>
            <ComponentGrid
              components={filteredComponents}
              isLoading={isLoading}
              onSelectComponent={addComponentToCanvas}
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// Función auxiliar para obtener componentes de ejemplo
function getExampleComponents(): GraphicComponent[] {
  return [
    // COMPONENTES BÁSICOS
    // ICONOS
    // UI ELEMENTS
    // WIDGETS
  ];
}
