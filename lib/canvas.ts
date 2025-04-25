import { fabric } from "fabric";
import { v4 as uuid4 } from "uuid";

import {
  CanvasMouseDown,
  CanvasMouseMove,
  CanvasMouseUp,
  CanvasObjectModified,
  CanvasObjectScaling,
  CanvasPathCreated,
  CanvasSelectionCreated,
  RenderCanvas,
} from "@/types/type";
import { defaultNavElement } from "@/constants";
import { createSpecificShape } from "./shapes";
import { LiveObject } from "@liveblocks/client";
import { useMutation, useStorage } from "@/liveblocks.config";

// initialize fabric canvas
export const initializeFabric = ({
  fabricRef,
  canvasRef,
}: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  // get canvas element
  const canvasElement = document.getElementById("canvas");

  // create fabric canvas
  const canvas = new fabric.Canvas(canvasRef.current, {
    width: canvasElement?.clientWidth,
    height: canvasElement?.clientHeight,
  });

  // set canvas reference to fabricRef so we can use it later anywhere outside canvas listener
  fabricRef.current = canvas;

  return canvas;
};

// instantiate creation of custom fabric object/shape and add it to canvas
export const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  shapeRef,
}: CanvasMouseDown) => {
  // get pointer coordinates
  const pointer = canvas.getPointer(options.e);

  const target = canvas.findTarget(options.e, false);

  // set canvas drawing mode to false
  canvas.isDrawingMode = false;

  // if selected shape is freeform, set drawing mode to true and return
  if (selectedShapeRef.current === "freeform") {
    isDrawing.current = true;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 5;
    return;
  }

  canvas.isDrawingMode = false;

  // if target is the selected shape or active selection, set isDrawing to false
  if (
    target &&
    (target.type === selectedShapeRef.current ||
      target.type === "activeSelection")
  ) {
    isDrawing.current = false;

    // set active object to target
    canvas.setActiveObject(target);
    target.setCoords();
  } else {
    isDrawing.current = true;

    // create custom fabric object/shape and set it to shapeRef
    shapeRef.current = createSpecificShape(
      selectedShapeRef.current,
      pointer as any
    );

    // if shapeRef is not null, add it to canvas
    if (shapeRef.current) {
      canvas.add(shapeRef.current);
    }
  }
};

// handle mouse move event on canvas to draw shapes with different dimensions
export const handleCanvaseMouseMove = ({
  options,
  canvas,
  isDrawing,
  selectedShapeRef,
  shapeRef,
  syncShapeInStorage,
}: CanvasMouseMove) => {
  // if selected shape is freeform, return
  if (!isDrawing.current) return;
  if (selectedShapeRef.current === "freeform") return;

  canvas.isDrawingMode = false;

  // get pointer coordinates
  const pointer = canvas.getPointer(options.e);

  // depending on the selected shape, set the dimensions of the shape stored in shapeRef in previous step of handelCanvasMouseDown
  // calculate shape dimensions based on pointer coordinates
  switch (selectedShapeRef?.current) {
    case "rectangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case "circle":
      shapeRef.current.set({
        radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
      });
      break;

    case "triangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case "line":
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;

    case "image":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });

    default:
      break;
  }

  // render objects on canvas
  canvas.renderAll();

  // sync shape in storage
  if (shapeRef.current?.objectId) {
    syncShapeInStorage(shapeRef.current);
  }
};

export const handleCanvasMouseUp = ({
  canvas,
  isDrawing,
  shapeRef,
  activeObjectRef,
  selectedShapeRef,
  syncShapeInStorage,
  setActiveElement,
}: CanvasMouseUp) => {
  if (isDrawing.current && shapeRef.current) {
    isDrawing.current = false;

    syncShapeInStorage(shapeRef.current);

    // Eliminar la referencia a useStorage.getState() que causa error
    // En su lugar, esto se manejará a través de useMutation en el componente
    // que llama a esta función

    if (selectedShapeRef.current === "freeform") return;

    shapeRef.current = null;
    activeObjectRef.current = null;
    selectedShapeRef.current = null;

    if (!canvas.isDrawingMode) {
      setTimeout(() => {
        setActiveElement(defaultNavElement);
      }, 700);
    }
  }
};

// Función para manejar modificación de objetos (movimiento, redimensionado, etc)
export const handleCanvasObjectModified = ({
  options,
  syncShapeInStorage,
}: CanvasObjectModified) => {
  const target = options.target;
  if (!target) return;

  if (target?.type === "activeSelection") {
    // Para selección múltiple
  } else {
    // Si es un objeto individual
    syncShapeInStorage(target);

    // Si es un grupo, actualizar la posición de todos los objetos dentro del grupo
    if (target.type === "group" && target instanceof fabric.Group) {
      const groupObjects = target.getObjects();
      // La posición del grupo ha cambiado, actualizar las posiciones relativas de los objetos
      groupObjects.forEach((obj) => {
        // Los objetos dentro del grupo ya tienen posiciones relativas al grupo
        // No necesitamos hacer nada más aquí, ya que Fabric.js maneja esto internamente
      });
    }

    // Si el objeto pertenece a un grupo (verificamos usando la propiedad _groupId)
    else if ((target as any)._groupId) {
      const canvas = target.canvas;
      if (canvas) {
        // Buscar el grupo al que pertenece este objeto
        const groupId = (target as any)._groupId;
        const group = findObjectById(canvas, groupId);

        if (group && group instanceof fabric.Group) {
          // El grupo necesita actualizarse cuando uno de sus objetos cambia
          // Podemos forzar una actualización del grupo aquí
          group.setCoords();
          syncShapeInStorage(group);
        }
      }
    }
  }
};

// Función auxiliar para encontrar un objeto por ID
export const findObjectById = (
  canvas: fabric.Canvas,
  objectId: string
): fabric.Object | null => {
  return (
    canvas.getObjects().find((obj) => (obj as any).objectId === objectId) ||
    null
  );
};

export const handlePathCreated = ({
  options,
  syncShapeInStorage,
}: CanvasPathCreated) => {
  const path = options.path;
  if (!path) return;

  path.set({
    objectId: uuid4(),
  });

  syncShapeInStorage(path);
  // Eliminar la referencia a useStorage.getState() que causa error
  // Esto se manejará a través de useMutation en el componente que llama a esta función
};

export const handleCanvasObjectMoving = ({
  options,
}: {
  options: fabric.IEvent;
}) => {
  const target = options.target as fabric.Object;

  const canvas = target.canvas as fabric.Canvas;

  target.setCoords();

  if (target && target.left) {
    target.left = Math.max(
      0,
      Math.min(
        target.left,
        (canvas.width || 0) - (target.getScaledWidth() || target.width || 0)
      )
    );
  }

  if (target && target.top) {
    target.top = Math.max(
      0,
      Math.min(
        target.top,
        (canvas.height || 0) - (target.getScaledHeight() || target.height || 0)
      )
    );
  }
};

export const handleCanvasSelectionCreated = ({
  options,
  isEditingRef,
  setElementAttributes,
}: CanvasSelectionCreated) => {
  if (isEditingRef.current) return;

  if (!options?.selected) return;

  const selectedElement = options?.selected[0] as fabric.Object;

  if (selectedElement && options.selected.length === 1) {
    const scaledWidth = selectedElement?.scaleX
      ? selectedElement?.width! * selectedElement?.scaleX
      : selectedElement?.width;

    const scaledHeight = selectedElement?.scaleY
      ? selectedElement?.height! * selectedElement?.scaleY
      : selectedElement?.height;

    setElementAttributes({
      width: scaledWidth?.toFixed(0).toString() || "",
      height: scaledHeight?.toFixed(0).toString() || "",
      fill: selectedElement?.fill?.toString() || "",
      stroke: selectedElement?.stroke || "",
      // @ts-ignore
      fontSize: selectedElement?.fontSize || "",
      // @ts-ignore
      fontFamily: selectedElement?.fontFamily || "",
      // @ts-ignore
      fontWeight: selectedElement?.fontWeight || "",
    });
  }
};

export const handleCanvasObjectScaling = ({
  options,
  setElementAttributes,
}: CanvasObjectScaling) => {
  const selectedElement = options.target;

  const scaledWidth = selectedElement?.scaleX
    ? selectedElement?.width! * selectedElement?.scaleX
    : selectedElement?.width;

  const scaledHeight = selectedElement?.scaleY
    ? selectedElement?.height! * selectedElement?.scaleY
    : selectedElement?.height;

  setElementAttributes((prev) => ({
    ...prev,
    width: scaledWidth?.toFixed(0).toString() || "",
    height: scaledHeight?.toFixed(0).toString() || "",
  }));
};

export const renderCanvas = ({
  fabricRef,
  canvasObjects,
  activeObjectRef,
}: RenderCanvas) => {
  // Limpiar el canvas actual
  fabricRef.current?.clear();

  // Crear un mapa para almacenar todos los objetos creados por su ID
  const createdObjects = new Map<string, fabric.Object>();
  // Mapeo de objetos que pertenecen a grupos
  const groupChildren = new Map<string, string[]>();
  // Objetos de grupo que necesitamos procesar
  const groupsToProcess = new Map<string, any>();

  // Primera pasada: identificar todos los grupos y sus hijos
  Array.from(canvasObjects, ([objectId, objectData]) => {
    // Si es un grupo con objetos, registrar sus hijos
    if (
      objectData.type === "group" &&
      objectData.objects &&
      objectData.objects.length > 0
    ) {
      groupsToProcess.set(objectId, objectData);
      groupChildren.set(objectId, []);
    }

    // Si este objeto está en un grupo (tiene _groupId), registrarlo
    if (objectData._groupId) {
      if (!groupChildren.has(objectData._groupId)) {
        groupChildren.set(objectData._groupId, []);
      }
      groupChildren.get(objectData._groupId)?.push(objectId);
    }
  });

  // Segunda pasada: crear todos los objetos que no son grupos
  Array.from(canvasObjects, ([objectId, objectData]) => {
    // Saltar los grupos por ahora, los procesaremos después
    if (objectData.type === "group") {
      return;
    }

    // También saltar objetos que pertenecen a grupos, los añadiremos como parte del grupo
    if (objectData._groupId && groupChildren.has(objectData._groupId)) {
      return;
    }

    // Crear el objeto normal
    fabric.util.enlivenObjects(
      [objectData],
      (enlivenedObjects: fabric.Object[]) => {
        enlivenedObjects.forEach((obj) => {
          // Guardar referencia al objeto creado
          createdObjects.set(objectId, obj);

          // Añadir al canvas los objetos que no pertenecen a grupos
          if (!objectData._groupId) {
            if (activeObjectRef.current?.objectId === objectId) {
              fabricRef.current?.setActiveObject(obj);
            }
            fabricRef.current?.add(obj);
          }
        });
      },
      "fabric"
    );
  });

  // Tercera pasada: crear los objetos de los grupos
  groupsToProcess.forEach((groupData, groupId) => {
    // Si el grupo tiene objetos definidos en su propiedad 'objects'
    if (groupData.objects && groupData.objects.length > 0) {
      // Crear objetos desde la definición del grupo
      const groupObjects: fabric.Object[] = [];

      Promise.all(
        groupData.objects.map((objData: any) => {
          return new Promise<fabric.Object>((resolve) => {
            const objId =
              objData.objectId ||
              `${groupId}-child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            fabric.util.enlivenObjects(
              [objData],
              (enlivenedObjects: fabric.Object[]) => {
                const obj = enlivenedObjects[0];
                // Asegurar que el objeto tenga un ID
                (obj as any).objectId = objId;
                // Marcar como parte del grupo
                (obj as any)._groupId = groupId;
                // Asegurar que el objeto sea visible dentro del grupo
                obj.visible = true;

                groupObjects.push(obj);
                resolve(obj);
              },
              "fabric"
            );
          });
        })
      ).then(() => {
        // Crear el grupo con estos objetos
        const options = {
          left: groupData.left || 0,
          top: groupData.top || 0,
          width: groupData.width,
          height: groupData.height,
          angle: groupData.angle || 0,
          scaleX: groupData.scaleX || 1,
          scaleY: groupData.scaleY || 1,
          objectId: groupId,
          visible: groupData.visible !== false,
        };

        const group = new fabric.Group(groupObjects, options);

        // Asegurarnos que el grupo sea visible
        group.visible = true;

        // Añadir el grupo al canvas
        fabricRef.current?.add(group);
        createdObjects.set(groupId, group);

        // Si este era el objeto activo, seleccionarlo
        if (activeObjectRef.current?.objectId === groupId) {
          fabricRef.current?.setActiveObject(group);
        }
      });
    }
  });

  // Renderizar el canvas
  fabricRef.current?.renderAll();
};

export const handleResize = ({ canvas }: { canvas: fabric.Canvas | null }) => {
  const canvasElement = document.getElementById("canvas");
  if (!canvasElement) return;

  if (!canvas) return;

  canvas.setDimensions({
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight,
  });
};

// zoom canvas on mouse scroll
export const handleCanvasZoom = ({
  options,
  canvas,
}: {
  options: fabric.IEvent & { e: WheelEvent };
  canvas: fabric.Canvas;
}) => {
  const delta = options.e?.deltaY;
  let zoom = canvas.getZoom();

  // allow zooming to min 20% and max 100%
  const minZoom = 0.2;
  const maxZoom = 1;
  const zoomStep = 0.001;

  // calculate zoom based on mouse scroll wheel with min and max zoom
  zoom = Math.min(Math.max(minZoom, zoom + delta * zoomStep), maxZoom);

  // set zoom to canvas
  canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);

  options.e.preventDefault();
  options.e.stopPropagation();
};

// #Funciones Layers

// Función para actualizar la estructura de capas al añadir un elemento
export const addLayerForObject = (object: fabric.Object, storage: any) => {
  const objectId = (object as any).objectId;
  if (!objectId) return;

  // Crear una capa para el objeto
  const layerData = createLayerForObject(object);
  if (!layerData) return;

  // Si storage es null, la función se está llamando desde un contexto donde no hay storage
  // En ese caso, no hacemos nada aquí y esperamos que se llame más adelante con un storage válido
  if (!storage) return layerData;

  // Añadir la nueva capa al mapa
  const layersMap = storage.get("layers");
  layersMap.set(layerData.id, layerData);

  // Añadir el ID de la capa a la lista de capas raíz
  const layerStructure = storage.get("layerStructure");
  layerStructure.update({
    rootLayerIds: [...layerStructure.get("rootLayerIds"), layerData.id],
  });

  return layerData;
};

// Función para eliminar una capa cuando se elimina un objeto
export const removeLayerForObject = (objectId: string, storage: any) => {
  // Si storage es null, la función se está llamando desde un contexto donde no hay storage
  // En ese caso, no hacemos nada aquí y esperamos que se llame más adelante con un storage válido
  if (!storage) return;

  const layersMap = storage.get("layers");
  const layerStructure = storage.get("layerStructure");

  // Buscar la capa que tiene este objectId
  let layerIdToRemove = null;
  for (const [id, layer] of layersMap.entries()) {
    if (layer.objectId === objectId) {
      layerIdToRemove = id;
      break;
    }
  }

  if (layerIdToRemove) {
    // Eliminar de rootLayerIds si es una capa raíz
    const rootLayerIds = layerStructure.get("rootLayerIds");
    if (rootLayerIds.includes(layerIdToRemove)) {
      layerStructure.update({
        rootLayerIds: rootLayerIds.filter((id) => id !== layerIdToRemove),
      });
    } else {
      // Buscar y eliminar de la lista de hijos de otra capa
      for (const [parentId, parentLayer] of layersMap.entries()) {
        if (
          parentLayer.childrenIds &&
          parentLayer.childrenIds.includes(layerIdToRemove)
        ) {
          const newChildrenIds = parentLayer.childrenIds.filter(
            (id) => id !== layerIdToRemove
          );
          layersMap.set(parentId, {
            ...parentLayer,
            childrenIds: newChildrenIds,
          });
          break;
        }
      }
    }

    // Eliminar la capa del mapa
    layersMap.delete(layerIdToRemove);
  }
};

// Función para encontrar una capa por objectId
export const findLayerIndexByObjectId = (
  layers: any[],
  objectId: string
): number => {
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].objectId === objectId) {
      return i;
    }
    // Si tiene hijos, buscar recursivamente
    if (layers[i].children && layers[i].children.length > 0) {
      const childIndex = findLayerIndexByObjectId(layers[i].children, objectId);
      if (childIndex !== -1) {
        return childIndex;
      }
    }
  }
  return -1;
};

// Obtener un nombre por defecto para un objeto según su tipo
export const getDefaultNameForObject = (object: fabric.Object): string => {
  const type = object.type;
  switch (type) {
    case "rectangle":
      return "Rectángulo";
    case "circle":
      return "Círculo";
    case "triangle":
      return "Triángulo";
    case "line":
      return "Línea";
    case "path":
      return "Trazo";
    case "i-text":
      return "Texto";
    case "text":
      return `Texto: ${(object as fabric.IText).text?.substring(0, 10) || ""}`;
    case "image":
      return "Imagen";
    case "path":
      return "Dibujo Libre";
    case "group":
      return "Grupo";
    default:
      return `Elemento ${type || ""}`;
  }
};

interface LayerStructureData {
  layerStructure: {
    rootLayerIds: string[];
    selectedLayerIds: string[];
  };
  layersMap: Map<string, any> | any;
}

// Función para actualizar el orden de los objetos en el canvas según la estructura de capas
export const updateCanvasOrderFromLayers = (
  canvas: fabric.Canvas,
  { layerStructure, layersMap }: LayerStructureData
) => {
  if (!canvas || !layerStructure || !layersMap) return;

  try {
    // Obtener todos los objetos del canvas
    const canvasObjects = canvas.getObjects();

    // Función recursiva para procesar capas y actualizar el orden de objetos
    const processLayers = (layerIds: string[], zIndex = 0): number => {
      let currentZIndex = zIndex;

      // Recorrer las capas en orden inverso (la última capa será la más alta en el canvas)
      for (let i = layerIds.length - 1; i >= 0; i--) {
        const layerId = layerIds[i];
        const layer = layersMap.get(layerId);

        if (!layer) continue;

        // Si la capa tiene hijos, procesarlos primero (capas anidadas)
        if (
          layer.type === "group" &&
          layer.childrenIds &&
          layer.childrenIds.length > 0
        ) {
          currentZIndex = processLayers(layer.childrenIds, currentZIndex);
        }

        // Actualizar el objeto de canvas si existe
        if (layer.objectId) {
          const object = canvasObjects.find(
            (obj) => (obj as any).objectId === layer.objectId
          );
          if (object) {
            // Mover el objeto al índice z apropiado
            canvas.moveTo(object, currentZIndex);
            currentZIndex++;
          }
        }
      }

      return currentZIndex;
    };

    // Comenzar procesando las capas raíz
    processLayers(layerStructure.rootLayerIds);

    // Renderizar el canvas para aplicar los cambios
    if (canvas && typeof canvas.renderAll === "function") {
      canvas.renderAll();
    }
  } catch (error) {
    console.error("Error en updateCanvasOrderFromLayers:", error);
  }
};

// Función para crear una capa para un nuevo objeto de fabric
export const createLayerForObject = (object: fabric.Object) => {
  const objectId = (object as any).objectId;
  if (!objectId) return null;

  return {
    id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: object.type || "Objeto",
    type: object.type || "element",
    visible: object.visible !== false,
    locked: !!object.lockMovementX && !!object.lockMovementY,
    childrenIds: [],
    objectId,
  };
};

// Función para sincronizar un nuevo objeto con la estructura de capas
export const syncNewObjectWithLayers = (
  storage: any,
  object: fabric.Object
) => {
  // Si storage es null, la función se está llamando desde un contexto donde no hay storage
  // En ese caso, no hacemos nada aquí y esperamos que se llame más adelante con un storage válido
  if (!storage) return;

  const objectId = (object as any).objectId;
  if (!objectId) return;

  // IMPORTANTE: Verificar si ya existe una capa con este objectId antes de crear una nueva
  const layersMap = storage.get("layers");

  // Buscar si ya existe una capa con este objectId
  let existingLayerId = null;
  for (const [id, layer] of layersMap.entries()) {
    if (layer.objectId === objectId) {
      existingLayerId = id;
      break;
    }
  }

  // Si ya existe una capa, no crear una nueva
  if (existingLayerId) {
    console.log(
      `Ya existe una capa para el objeto ${objectId}, no se creará una nueva`
    );
    return;
  }

  // Si no existe, crear una nueva capa
  const layerData = createLayerForObject(object);
  if (!layerData) return;

  const layerStructure = storage.get("layerStructure");

  // Añadir la nueva capa al mapa
  layersMap.set(layerData.id, layerData);

  // Añadir el ID de la capa a la lista de capas raíz
  layerStructure.update({
    rootLayerIds: [...layerStructure.get("rootLayerIds"), layerData.id],
  });
};
