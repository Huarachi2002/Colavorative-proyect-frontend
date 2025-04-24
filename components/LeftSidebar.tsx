"use client";

import { useEffect, useState } from "react";
import { fabric } from "fabric";
import { cn } from "@/lib/utils";
import { useMutation, useStorage, useMap } from "@/liveblocks.config";
import { updateCanvasOrderFromLayers } from "@/lib/canvas";

import {
  ChevronDown,
  ChevronRight,
  Layers,
  Eye,
  EyeOff,
  Ungroup,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";

interface LeftSidebarProps {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  activeObjectRef: React.MutableRefObject<fabric.Object | null>;
  syncShapeInStorage: (object: fabric.Object) => void;
}

export default function LeftSidebar({
  fabricRef,
  activeObjectRef,
  syncShapeInStorage,
}: LeftSidebarProps) {
  // Obtener la estructura de capas y el mapa de capas
  const layerStructure = useStorage((root) => root.layerStructure);
  const layersMap = useMap("layers");
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null);

  useEffect(() => {
    // Asegurarse de que fabricRef.current existe antes de llamar a updateCanvasOrderFromLayers
    if (fabricRef.current && layerStructure && layersMap) {
      try {
        // Actualizar esta función para trabajar con la nueva estructura
        updateCanvasOrderFromLayers(fabricRef.current, {
          layerStructure: {
            rootLayerIds: layerStructure.rootLayerIds,
            selectedLayerIds: layerStructure.selectedLayerIds,
          },
          layersMap,
        });
      } catch (error) {
        console.error("Error al actualizar el orden del canvas:", error);
      }
    }
  }, [layerStructure, layersMap, fabricRef]);

  const toggleLayerVisibility = useMutation(
    ({ storage }, layerId: string) => {
      // Obtener la capa directamente del mapa de capas
      const layersMap = storage.get("layers");
      const layer = layersMap.get(layerId);

      if (layer) {
        const visible = !layer.visible;

        // Actualizar la visibilidad de la capa
        layersMap.set(layerId, {
          ...layer,
          visible,
        });

        // Si hay un canvas y un objeto asociado, actualizar su visibilidad
        if (fabricRef.current) {
          const objectId = layer.objectId;
          if (objectId) {
            const object = findObjectById(fabricRef.current, objectId);
            if (object) {
              object.visible = visible;
              fabricRef.current.renderAll();

              // Sincronizar cambios con otros usuarios
              syncShapeInStorage(object);
            }
          }
        }
      }
    },
    [fabricRef, syncShapeInStorage]
  );

  const toggleLayerExpanded = useMutation(({ storage }, layerId: string) => {
    const layersMap = storage.get("layers");
    const layer = layersMap.get(layerId);
    console.log("LayerMap", layersMap);
    console.log("layer", layer);

    if (layer) {
      const expanded = !layer.expanded;
      layersMap.set(layerId, {
        ...layer,
        expanded,
      });
    }
  }, []);

  const selectLayer = useMutation(
    ({ storage }, layerId: string) => {
      const layerStructure = storage.get("layerStructure");
      const layersMap = storage.get("layers");
      console.log("LayerMap", layersMap);
      console.log("layerStructure", layerStructure);

      // Seleccionar solamente esta capa
      layerStructure.update({
        selectedLayerIds: [layerId],
      });

      // Si hay un canvas y un objeto asociado, seleccionarlo
      if (fabricRef.current) {
        const layer = layersMap.get(layerId);

        if (layer) {
          const objectId = layer.objectId;

          if (objectId) {
            const object = findObjectById(fabricRef.current, objectId);
            if (object) {
              fabricRef.current.discardActiveObject();
              fabricRef.current.setActiveObject(object);
              activeObjectRef.current = object;
              fabricRef.current.renderAll();
            }
          }
        }
      }
    },
    [fabricRef, activeObjectRef]
  );

  // Obtener todas las capas raíz
  const getRootLayers = (): string[] => {
    return layerStructure?.rootLayerIds || [];
  };

  // Obtener los hijos de una capa
  const getLayerChildren = (layerId: string): string[] => {
    const layer = layersMap?.get(layerId);
    return layer?.childrenIds || [];
  };

  const moveLayerUp = useMutation(
    ({ storage }, layerId: string) => {
      const layerStructure = storage.get("layerStructure");
      const rootLayerIds = layerStructure.get("rootLayerIds");

      // Encontrar si la capa está en la raíz o es hijo de otra capa
      const rootIndex = rootLayerIds.indexOf(layerId);

      if (rootIndex !== -1 && rootIndex < rootLayerIds.length - 1) {
        // Es una capa raíz, intercambiar posiciones
        const newRootLayerIds = [...rootLayerIds];
        const temp = newRootLayerIds[rootIndex];
        newRootLayerIds[rootIndex] = newRootLayerIds[rootIndex + 1];
        newRootLayerIds[rootIndex + 1] = temp;

        layerStructure.update({
          rootLayerIds: newRootLayerIds,
        });
      } else {
        // Buscar en qué capa padre está este elemento
        const layersMap = storage.get("layers");

        for (const [parentId, parentLayer] of layersMap.entries()) {
          const childrenIds = parentLayer.childrenIds || [];
          const childIndex = childrenIds.indexOf(layerId);

          if (childIndex !== -1 && childIndex < childrenIds.length - 1) {
            // Encontramos el padre, intercambiamos posiciones de los hijos
            const newChildrenIds = [...childrenIds];
            const temp = newChildrenIds[childIndex];
            newChildrenIds[childIndex] = newChildrenIds[childIndex + 1];
            newChildrenIds[childIndex + 1] = temp;

            layersMap.set(parentId, {
              ...parentLayer,
              childrenIds: newChildrenIds,
            });
            break;
          }
        }
      }

      // Actualizar el orden en el canvas
      if (fabricRef.current) {
        updateCanvasOrderFromLayers(fabricRef.current, {
          layerStructure: {
            rootLayerIds: layerStructure.get("rootLayerIds"),
            selectedLayerIds: layerStructure.get("selectedLayerIds"),
          },
          layersMap: storage.get("layers"),
        });
      }
    },
    [fabricRef]
  );

  const moveLayerDown = useMutation(
    ({ storage }, layerId: string) => {
      const layerStructure = storage.get("layerStructure");
      const rootLayerIds = layerStructure.get("rootLayerIds");

      // Encontrar si la capa está en la raíz o es hijo de otra capa
      const rootIndex = rootLayerIds.indexOf(layerId);

      if (rootIndex > 0) {
        // Es una capa raíz, intercambiar posiciones
        const newRootLayerIds = [...rootLayerIds];
        const temp = newRootLayerIds[rootIndex];
        newRootLayerIds[rootIndex] = newRootLayerIds[rootIndex - 1];
        newRootLayerIds[rootIndex - 1] = temp;

        layerStructure.update({
          rootLayerIds: newRootLayerIds,
        });
      } else {
        // Buscar en qué capa padre está este elemento
        const layersMap = storage.get("layers");

        for (const [parentId, parentLayer] of layersMap.entries()) {
          const childrenIds = parentLayer.childrenIds || [];
          const childIndex = childrenIds.indexOf(layerId);

          if (childIndex > 0) {
            // Encontramos el padre, intercambiamos posiciones de los hijos
            const newChildrenIds = [...childrenIds];
            const temp = newChildrenIds[childIndex];
            newChildrenIds[childIndex] = newChildrenIds[childIndex - 1];
            newChildrenIds[childIndex - 1] = temp;

            layersMap.set(parentId, {
              ...parentLayer,
              childrenIds: newChildrenIds,
            });
            break;
          }
        }
      }

      // Actualizar el orden en el canvas
      if (fabricRef.current) {
        updateCanvasOrderFromLayers(fabricRef.current, {
          layerStructure: {
            rootLayerIds: layerStructure.get("rootLayerIds"),
            selectedLayerIds: layerStructure.get("selectedLayerIds"),
          },
          layersMap: storage.get("layers"),
        });
      }
    },
    [fabricRef]
  );

  const createGroup = useMutation(
    ({ storage }) => {
      const layerStructure = storage.get("layerStructure");
      const selectedLayerIds = layerStructure.get("selectedLayerIds");
      const layersMap = storage.get("layers");

      console.log("selectedLayerIds", selectedLayerIds);
      // Necesitamos al menos 2 capas seleccionadas para crear un grupo
      if (selectedLayerIds.length < 2) {
        return;
      }

      // Crear un nuevo grupo con ID único
      const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const objectId = `obj-${Date.now()}`;

      // Añadir el grupo al mapa de capas
      layersMap.set(groupId, {
        id: groupId,
        name: "Grupo",
        type: "group",
        visible: true,
        locked: false,
        expanded: true,
        childrenIds: [...selectedLayerIds], // Los hijos son las capas seleccionadas
        objectId,
      });

      // Determinar dónde insertar el grupo (en la raíz o como hijo de otro grupo)
      const rootLayerIds = layerStructure.get("rootLayerIds");

      // Filtrar las capas raíz que no están en las seleccionadas
      const newRootLayerIds = rootLayerIds.filter(
        (id) => !selectedLayerIds.includes(id)
      );

      // Añadir el nuevo grupo a las capas raíz
      newRootLayerIds.push(groupId);

      layerStructure.update({
        rootLayerIds: newRootLayerIds,
        selectedLayerIds: [groupId], // Seleccionar el nuevo grupo
      });

      // Si estamos usando Fabric.js, también debemos agrupar los objetos
      if (fabricRef.current) {
        const objectsToGroup = [];

        for (const childId of selectedLayerIds) {
          const childLayer = layersMap.get(childId);
          if (childLayer && childLayer.objectId) {
            const object = findObjectById(
              fabricRef.current,
              childLayer.objectId
            );
            if (object) {
              objectsToGroup.push(object);
            }
          }
        }

        if (objectsToGroup.length >= 2) {
          const group = new fabric.Group(objectsToGroup, {
            objectId,
          } as fabric.IGroupOptions & { objectId: string });

          fabricRef.current.add(group);
          fabricRef.current.renderAll();

          // Sincronizar con otros usuarios
          syncShapeInStorage(group);
        }
      }
    },
    [fabricRef, syncShapeInStorage]
  );

  const ungroup = useMutation(
    ({ storage }) => {
      const layerStructure = storage.get("layerStructure");
      const selectedLayerIds = layerStructure.get("selectedLayerIds");
      const layersMap = storage.get("layers");

      // Solo podemos desagrupar si hay una capa seleccionada
      if (selectedLayerIds.length !== 1) {
        return;
      }

      const layerId = selectedLayerIds[0];
      const layer = layersMap.get(layerId);

      // Solo podemos desagrupar grupos
      if (!layer || layer.type !== "group") {
        return;
      }

      const childrenIds = layer.childrenIds || [];

      // Actualizar la estructura para mover los hijos a la raíz
      const rootLayerIds = layerStructure.get("rootLayerIds");
      const rootIndex = rootLayerIds.indexOf(layerId);

      if (rootIndex !== -1) {
        // El grupo estaba en la raíz
        const newRootLayerIds = [
          ...rootLayerIds.slice(0, rootIndex),
          ...childrenIds,
          ...rootLayerIds.slice(rootIndex + 1),
        ];

        layerStructure.update({
          rootLayerIds: newRootLayerIds,
          selectedLayerIds: [], // Limpiar selección
        });
      } else {
        // El grupo era hijo de otro grupo
        for (const [parentId, parentLayer] of layersMap.entries()) {
          const parentChildrenIds = parentLayer.childrenIds || [];
          const groupIndex = parentChildrenIds.indexOf(layerId);

          if (groupIndex !== -1) {
            // Reemplazar el grupo con sus hijos en el padre
            const newParentChildrenIds = [
              ...parentChildrenIds.slice(0, groupIndex),
              ...childrenIds,
              ...parentChildrenIds.slice(groupIndex + 1),
            ];

            layersMap.set(parentId, {
              ...parentLayer,
              childrenIds: newParentChildrenIds,
            });
            break;
          }
        }
      }

      // Si estamos usando Fabric.js, también debemos desagrupar los objetos
      if (fabricRef.current && layer.objectId) {
        const group = findObjectById(fabricRef.current, layer.objectId);
        if (group && group.type === "group") {
          const items = (group as fabric.Group).getObjects();
          (group as fabric.Group).destroy();

          // Eliminar el grupo del canvas
          fabricRef.current.remove(group);

          // Añadir los objetos individuales de nuevo al canvas
          for (const item of items) {
            // Asignar un nuevo ID si no tiene uno
            if (!(item as any).objectId) {
              (item as any).objectId =
                `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            fabricRef.current.add(item);

            // Sincronizar con otros usuarios
            syncShapeInStorage(item);
          }

          fabricRef.current.renderAll();
        }
      }

      // Finalmente, eliminar el grupo del mapa de capas
      layersMap.delete(layerId);
    },
    [fabricRef, syncShapeInStorage]
  );

  const deleteLayer = useMutation(
    ({ storage }, layerId: string) => {
      const layerStructure = storage.get("layerStructure");
      const layersMap = storage.get("layers");
      const layer = layersMap.get(layerId);

      if (layer) {
        // Eliminar el objeto del canvas si existe
        if (fabricRef.current && layer.objectId) {
          const object = findObjectById(fabricRef.current, layer.objectId);
          if (object) {
            fabricRef.current.remove(object);
            fabricRef.current.renderAll();
          }
        }

        // Eliminar la capa de la estructura (raíz o padre)
        const rootLayerIds = layerStructure.get("rootLayerIds");
        const rootIndex = rootLayerIds.indexOf(layerId);

        if (rootIndex !== -1) {
          // Era una capa raíz
          layerStructure.update({
            rootLayerIds: rootLayerIds.filter((id) => id !== layerId),
          });
        } else {
          // Era hijo de otro grupo
          for (const [parentId, parentLayer] of layersMap.entries()) {
            const childrenIds = parentLayer.childrenIds || [];
            if (childrenIds.includes(layerId)) {
              layersMap.set(parentId, {
                ...parentLayer,
                childrenIds: childrenIds.filter((id) => id !== layerId),
              });
              break;
            }
          }
        }

        // Actualizar la selección si esta capa estaba seleccionada
        const selectedLayerIds = layerStructure.get("selectedLayerIds");
        if (selectedLayerIds.includes(layerId)) {
          layerStructure.update({
            selectedLayerIds: selectedLayerIds.filter((id) => id !== layerId),
          });
        }

        // Eliminar la capa del mapa
        layersMap.delete(layerId);
      }
    },
    [fabricRef]
  );

  // ... métodos de manejo de arrastrar y soltar ...
  const handleDragStart = (event: React.DragEvent, layerId: string) => {
    setDraggedLayer(layerId);
    event.dataTransfer.setData("text/plain", layerId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.add("bg-gray-100");
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove("bg-gray-100");
  };

  const handleDrop = useMutation(
    ({ storage }, event: React.DragEvent, targetLayerId: string) => {
      event.preventDefault();
      const target = event.currentTarget as HTMLElement;
      target.classList.remove("bg-gray-100");

      const sourceLayerId = event.dataTransfer.getData("text/plain");
      if (!sourceLayerId || sourceLayerId === targetLayerId) return;

      const layerStructure = storage.get("layerStructure");
      const layersMap = storage.get("layers");

      // Encontrar dónde están las capas fuente y destino
      const rootLayerIds = layerStructure.get("rootLayerIds");
      const sourceInRoot = rootLayerIds.includes(sourceLayerId);
      const targetInRoot = rootLayerIds.includes(targetLayerId);

      if (sourceInRoot && targetInRoot) {
        // Ambos están en la raíz, reordenar ahí
        const sourceIndex = rootLayerIds.indexOf(sourceLayerId);
        const targetIndex = rootLayerIds.indexOf(targetLayerId);

        // Crear nuevo array sin la fuente
        const newRootLayerIds = rootLayerIds.filter(
          (id) => id !== sourceLayerId
        );

        // Insertar la fuente en la posición correcta
        const adjustedTargetIndex =
          sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newRootLayerIds.splice(adjustedTargetIndex, 0, sourceLayerId);

        layerStructure.update({
          rootLayerIds: newRootLayerIds,
        });
      } else {
        // Caso más complejo - necesitamos manejar diferentes padres
        // Implementar lógica para mover entre diferentes niveles de la jerarquía
        // (Por brevedad, aquí solo manejamos el caso simple de capas raíz)
      }

      setDraggedLayer(null);

      // Actualizar el orden en el canvas
      if (fabricRef.current) {
        updateCanvasOrderFromLayers(fabricRef.current, {
          layerStructure: {
            rootLayerIds: layerStructure.get("rootLayerIds"),
            selectedLayerIds: layerStructure.get("selectedLayerIds"),
          },
          layersMap,
        });
      }
    },
    [fabricRef]
  );

  const renameLayer = useMutation(
    ({ storage }, layerId: string, newName: string) => {
      const layersMap = storage.get("layers");
      const layer = layersMap.get(layerId);

      if (layer) {
        layersMap.set(layerId, {
          ...layer,
          name: newName,
        });
      }
    },
    []
  );

  // Función para renderizar una capa y sus hijos
  const renderLayer = (layerId: string, depth = 0) => {
    if (!layersMap) return null;

    const layer = layersMap.get(layerId);
    if (!layer) return null;

    const { id, name, type, visible, locked, expanded = true } = layer;
    const childrenIds = layer.childrenIds || [];
    const selectedLayerIds = layerStructure?.selectedLayerIds || [];
    const isSelected = selectedLayerIds.includes(id);

    return (
      <div key={id} className='select-none'>
        <div
          className={cn(
            "flex cursor-pointer items-center px-2 py-1 text-sm",
            isSelected ? "bg-blue-100" : "hover:bg-gray-100",
            draggedLayer === id ? "opacity-50" : "opacity-100"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => selectLayer(id)}
          draggable
          onDragStart={(e) => handleDragStart(e, id)}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, id)}
        >
          {/* Expandir/Colapsar (solo para grupos) */}
          {type === "group" && childrenIds.length > 0 ? (
            <Button
              className='mr-1 rounded p-1 hover:bg-gray-200'
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerExpanded(id);
              }}
            >
              {expanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </Button>
          ) : (
            <span className='w-6' />
          )}

          {/* Icono de tipo */}
          <span className='mr-2'>
            {type === "group" ? (
              <Layers size={14} />
            ) : (
              getIconForLayerType(type)
            )}
          </span>

          {/* Nombre */}
          <span className='flex-grow truncate'>{name}</span>

          {/* Acciones */}
          <div className='flex items-center space-x-1 opacity-60 hover:opacity-100'>
            {/* Visibilidad */}
            <Button
              className='rounded p-1 hover:bg-gray-200'
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility(id);
              }}
              title={visible ? "Ocultar" : "Mostrar"}
            >
              {visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </Button>

            {/* Cambiar Nombre */}
            <Button
              className='rounded p-1 hover:bg-gray-200'
              onClick={(e) => {
                e.stopPropagation();
                const newName = prompt("Ingrese nuevo nombre:", name);
                if (newName && newName !== name) {
                  renameLayer(id, newName);
                }
              }}
              title='Renombrar capa'
            >
              <span className='text-xs'>✏️</span>
            </Button>
          </div>
        </div>

        {/* Renderizar hijos si es un grupo y está expandido */}
        {type === "group" && expanded && childrenIds.length > 0 && (
          <div>
            {childrenIds.map((childId) => renderLayer(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className='flex h-full w-[240px] flex-col border-r border-gray-200 bg-white'>
      <div className='border-b p-4'>
        <h2 className='flex items-center text-lg font-medium'>
          <Layers className='mr-2' size={18} />
          Capas
        </h2>
      </div>

      {/* Barra de acciones */}
      <div className='flex items-center justify-between border-b p-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => createGroup()}
          title='Agrupar seleccionados'
        >
          <Layers size={16} />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => ungroup()}
          title='Desagrupar'
        >
          <Ungroup size={16} />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            // Crear una nueva "página" o capa contenedora
            // Implementa esta funcionalidad si la necesitas
          }}
          title='Añadir contenedor'
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Lista de capas */}
      <div className='flex-grow overflow-y-auto'>
        {layerStructure && layersMap && getRootLayers().length > 0 ? (
          <div className='p-1'>
            {getRootLayers().map((layerId) => renderLayer(layerId))}
          </div>
        ) : (
          <div className='flex h-full items-center justify-center text-sm text-gray-500'>
            No hay elementos en el canvas
          </div>
        )}
      </div>
    </aside>
  );
}

// Función auxiliar para encontrar un objeto Fabric por ID
const findObjectById = (
  canvas: fabric.Canvas,
  objectId: string
): fabric.Object | null => {
  return (
    canvas.getObjects().find((obj) => (obj as any).objectId === objectId) ||
    null
  );
};

// Función para obtener el icono apropiado para el tipo de capa
const getIconForLayerType = (type: string) => {
  switch (type) {
    case "rectangle":
      return <div className='h-3 w-3 border border-current'></div>;
    case "circle":
      return <div className='h-3 w-3 rounded-full border border-current'></div>;
    case "triangle":
      return (
        <div className='h-0 w-0 border-b-[8px] border-l-[5px] border-r-[5px] border-transparent border-b-current'></div>
      );
    case "line":
      return <div className='h-1 w-3 bg-current'></div>;
    case "text":
      return <span className='text-xs'>T</span>;
    case "image":
      return <span className='text-xs'>🖼️</span>;
    case "path":
      return <span className='text-xs'>📝</span>;
    default:
      return <span className='h-3 w-3'></span>;
  }
};
