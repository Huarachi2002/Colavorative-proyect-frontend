"use client";

import Navbar from "@/components/Navbar";
import Live from "@/components/Live";
import RightSidebar from "@/components/RightSidebar";
import LeftSidebar from "@/components/LeftSidebar";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import {
  handleCanvaseMouseMove,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handlePathCreated,
  handleResize,
  initializeFabric,
  renderCanvas,
  syncNewObjectWithLayers,
} from "@/lib/canvas";
import { ActiveElement, Attributes } from "@/types/type";
import { useMutation, useRedo, useStorage, useUndo } from "@/liveblocks.config";
import { defaultNavElement } from "@/constants";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import {
  createCircle,
  createLine,
  createRectangle,
  createText,
  createTriangle,
  handleImageUpload,
} from "@/lib/shapes";
import { useParams } from "next/navigation";

export default function ProjectCanvas() {
  const undo = useUndo();
  const redo = useRedo();

  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<String | null>("rectangle");
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const canvasObjects = useStorage((root) => root.canvasObjects);
  const layerStructure = useStorage((root) => root.layerStructure);
  const layersMap = useStorage((root) => root.layers);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);
  const [layersInitialized, setLayersInitialized] = useState(false);

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: "",
    height: "",
    fontSize: "",
    fontFamily: "",
    fontWeight: "",
    fill: "#aabbcc",
    stroke: "#aabbcc",
  });

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;

    const { objectId } = object;

    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);

    // Intentar sincronizar el objeto con la estructura de capas si no existe ya
    // Esto ahora es seguro gracias a la verificación en syncNewObjectWithLayers
    syncNewObjectWithLayers(storage, object);
  }, []);

  // Ya no necesitamos esta función separada, ya que syncShapeInStorage ya hace esto
  // La mantenemos por compatibilidad pero está deprecada
  const handleAddObjectToLayers = useMutation(({ storage }, object) => {
    if (!object) return;
    // Esto ya se hace en syncShapeInStorage y allí ya verificamos duplicados
    // Así que no debería causar problemas
    syncNewObjectWithLayers(storage, object);
  }, []);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  // Función para asegurarse de que la estructura de capas esté inicializada y sincronizada con los objetos del canvas
  const ensureLayersInitialized = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");
    const layerStructure = storage.get("layerStructure");
    const layersMap = storage.get("layers");

    // Si no hay objetos en el canvas, no hay nada que inicializar
    if (!canvasObjects || canvasObjects.size === 0) return false;

    // Mapear los grupos y sus hijos para restaurar las relaciones luego
    const groupRelations = new Map();

    // Identificar objetos que pertenecen a grupos primero
    for (const [objectId, objectData] of canvasObjects.entries()) {
      if (objectData._groupId) {
        if (!groupRelations.has(objectData._groupId)) {
          groupRelations.set(objectData._groupId, []);
        }
        groupRelations.get(objectData._groupId).push(objectId);
      }
    }

    // Verificar si ya hay capas definidas
    if (
      layerStructure &&
      layerStructure.rootLayerIds &&
      layerStructure.rootLayerIds.length > 0
    ) {
      let childrenMappedCorrectly = true;

      // Verificar si todas las capas tienen las relaciones de hijos correctas
      for (const [layerId, layer] of layersMap.entries()) {
        // Si es un grupo, verificar si tiene los hijos correctos
        if (layer.type === "group" && layer.objectId) {
          const expectedChildren = groupRelations.get(layer.objectId) || [];

          // Encontrar las capas correspondientes a estos objectIds
          const childLayerIds = [];
          for (const childObjectId of expectedChildren) {
            for (const [childLayerId, childLayer] of layersMap.entries()) {
              if (childLayer.objectId === childObjectId) {
                childLayerIds.push(childLayerId);
                break;
              }
            }
          }

          // Si los hijos no coinciden, necesitamos reconstruir
          if (
            childLayerIds.length !== expectedChildren.length ||
            !layer.childrenIds ||
            layer.childrenIds.length !== childLayerIds.length
          ) {
            childrenMappedCorrectly = false;
            break;
          }

          // Verificar que todos los IDs de hijo esperados estén presentes
          for (const childId of childLayerIds) {
            if (!layer.childrenIds || !layer.childrenIds.includes(childId)) {
              childrenMappedCorrectly = false;
              break;
            }
          }

          if (!childrenMappedCorrectly) break;
        }
      }

      // Si todas las relaciones están correctas, no hacemos nada
      if (childrenMappedCorrectly) {
        console.log(
          "Las relaciones entre grupos y elementos están correctas, no se requiere reconstrucción"
        );
        return true;
      }

      console.log(
        "Se detectaron problemas en las relaciones entre grupos y elementos, reconstruyendo..."
      );
    }

    // Si llegamos aquí, necesitamos reconstruir la estructura de capas

    // Creamos un mapa de los nombres personalizados actuales para preservarlos
    const customNames = new Map();
    for (const [layerId, layer] of layersMap.entries()) {
      if (layer.objectId) {
        customNames.set(layer.objectId, layer.name);
      }
    }

    // Limpiar la estructura de capas existente
    const rootLayerIds: string[] = [];

    // Eliminar cualquier capa existente
    for (const [key] of layersMap.entries()) {
      layersMap.delete(key);
    }

    // Primero, crear capas para todos los objetos
    const objectIdToLayerId = new Map();

    for (const [objectId, objectData] of canvasObjects.entries()) {
      // No crear capas para objetos que son parte de un grupo todavía
      // Lo haremos después para asegurarnos de que mantengan la relación correcta
      if (objectData._groupId) {
        continue;
      }

      const type = objectData.type || "unknown";
      const layerId = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Usar el nombre personalizado si existe, o crear uno nuevo basado en el tipo
      const name =
        customNames.get(objectId) ||
        (type === "i-text" && objectData.text
          ? `Texto: ${objectData.text.substring(0, 15)}`
          : type.charAt(0).toUpperCase() + type.slice(1));

      const newLayer = {
        id: layerId,
        name,
        type,
        visible: objectData.visible !== false,
        locked: false,
        childrenIds: [],
        objectId,
      };

      layersMap.set(layerId, newLayer);
      objectIdToLayerId.set(objectId, layerId);

      // Si no es un objeto de grupo, añadirlo directamente a la raíz
      if (type !== "group") {
        rootLayerIds.push(layerId);
      }
    }

    // Segundo paso: procesar grupos y sus relaciones
    for (const [objectId, objectData] of canvasObjects.entries()) {
      // Solo procesar objetos de tipo grupo
      if (objectData.type !== "group") {
        continue;
      }

      const layerId = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const name = customNames.get(objectId) || "Grupo";

      // Encontrar los objetos que pertenecen a este grupo
      const childrenObjectIds = groupRelations.get(objectId) || [];
      const childrenLayerIds: string[] = [];

      // Crear capas para los hijos si no existen todavía
      for (const childObjectId of childrenObjectIds) {
        let childLayerId = objectIdToLayerId.get(childObjectId);

        // Si no existe una capa para este objeto hijo, crearla
        if (!childLayerId) {
          const childData = canvasObjects.get(childObjectId);
          if (childData) {
            childLayerId = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const childName =
              customNames.get(childObjectId) ||
              (childData.type === "i-text" && childData.text
                ? `Texto: ${childData.text.substring(0, 15)}`
                : childData.type.charAt(0).toUpperCase() +
                  childData.type.slice(1));

            const childLayer = {
              id: childLayerId,
              name: childName,
              type: childData.type || "unknown",
              visible: childData.visible !== false,
              locked: false,
              childrenIds: [],
              objectId: childObjectId,
            };

            layersMap.set(childLayerId, childLayer);
            objectIdToLayerId.set(childObjectId, childLayerId);
          }
        }

        // Si encontramos un ID de capa válido, añadirlo a los hijos del grupo
        if (childLayerId) {
          childrenLayerIds.push(childLayerId);

          // Eliminar este hijo de la raíz si estaba allí
          const rootIndex = rootLayerIds.indexOf(childLayerId);
          if (rootIndex !== -1) {
            rootLayerIds.splice(rootIndex, 1);
          }
        }
      }

      // Crear la capa de grupo con sus hijos
      const groupLayer = {
        id: layerId,
        name,
        type: "group",
        visible: objectData.visible !== false,
        locked: false,
        expanded: true,
        childrenIds: childrenLayerIds,
        objectId,
      };

      layersMap.set(layerId, groupLayer);
      objectIdToLayerId.set(objectId, layerId);

      // Añadir el grupo a la raíz
      rootLayerIds.push(layerId);
    }

    // Actualizar la estructura de capas
    layerStructure.update({
      rootLayerIds,
      selectedLayerIds: [],
    });

    console.log(
      "Estructura de capas reconstruida correctamente con las relaciones de grupo preservadas"
    );
    return true;
  }, []);

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");

    if (!canvasObjects || canvasObjects.size === 0) return true;

    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }

    // Limpiar también la estructura de capas
    const layerStructure = storage.get("layerStructure");
    const layersMap = storage.get("layers");

    // Limpiar las capas
    layerStructure.update({
      rootLayerIds: [],
      selectedLayerIds: [],
    });

    // Limpiar el mapa de capas
    for (const [key] of layersMap.entries()) {
      layersMap.delete(key);
    }

    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);

    // Buscar y eliminar la capa asociada con este objeto
    const layersMap = storage.get("layers");
    const layerStructure = storage.get("layerStructure");

    // Encontrar la capa que tiene este objectId
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

      // Actualizar la selección si esta capa estaba seleccionada
      const selectedLayerIds = layerStructure.get("selectedLayerIds");
      if (selectedLayerIds.includes(layerIdToRemove)) {
        layerStructure.update({
          selectedLayerIds: selectedLayerIds.filter(
            (id) => id !== layerIdToRemove
          ),
        });
      }
    }
  }, []);

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      case "reset":
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;

      case "delete":
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;

      case "image":
        imageInputRef.current?.click();
        isDrawing.current = false;

        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = false;
        }
        break;
      default:
        break;
    }

    selectedShapeRef.current = elem?.value as string;
  };

  useEffect(() => {
    if (!fabricRef.current) return;

    const loadProjectObjects = async () => {
      try {
        // Verificar si hay objetos importados en localStorage
        const importedObjectsStr = localStorage.getItem(
          "importedSketchObjects"
        );
        if (!importedObjectsStr) return;

        // Parsear los objetos importados
        const importedObjects = JSON.parse(importedObjectsStr);
        if (!importedObjects || !importedObjects.length) return;
        // Limpiar localStorage después de cargar los objetos
        localStorage.removeItem("importedSketchObjects");
        // Para cada objeto importado, crear el objeto Fabric correspondiente
        importedObjects.forEach((element: any) => {
          try {
            const simulatedPointer = {
              x: element.left || 0,
              y: element.top || 0,
            } as unknown as PointerEvent;

            let fabricObject: fabric.Object | null = null;

            switch (element.type) {
              case "rectangle":
                fabricObject = createRectangle(simulatedPointer);
                if (fabricObject) {
                  fabricObject.set({
                    left: element.left,
                    top: element.top,
                    width: element.width || 100,
                    height: element.height || 100,
                    fill: element.fill || "#aabbcc",
                  } as fabric.IRectOptions);
                }
                break;
              case "triangle":
                fabricObject = createTriangle(simulatedPointer);
                if (fabricObject) {
                  fabricObject.set({
                    left: element.left,
                    top: element.top,
                    width: element.width || 100,
                    height: element.height || 100,
                    fill: element.fill || "#aabbcc",
                  } as fabric.ITriangleOptions);
                }
                break;

              case "circle":
                fabricObject = createCircle(simulatedPointer);
                if (fabricObject) {
                  fabricObject.set({
                    left: element.left,
                    top: element.top,
                    radius: element.radius || 50,
                    fill: element.fill || "#aabbcc",
                  } as fabric.ICircleOptions);
                }
                break;

              case "line":
                fabricObject = createLine(simulatedPointer);
                if (
                  fabricObject &&
                  element.points &&
                  element.points.length === 4
                ) {
                  fabricObject.set({
                    x1: element.points[0],
                    y1: element.points[1],
                    x2: element.points[2],
                    y2: element.points[3],
                    stroke: element.stroke || "#aabbcc",
                  } as fabric.ILineOptions);
                }
                break;

              case "text":
                fabricObject = createText(
                  simulatedPointer,
                  element.text || "Texto"
                );
                if (fabricObject) {
                  fabricObject.set({
                    left: element.left,
                    top: element.top,
                    fill: element.fill || "#aabbcc",
                    fontFamily: element.fontFamily || "Helvetica",
                    fontSize: element.fontSize || 36,
                    fontWeight: element.fontWeight || "400",
                  } as fabric.ITextOptions);
                }
                break;

              case "path":
                if (element.path) {
                  fabricObject = new fabric.Path(element.path, {
                    left: element.left,
                    top: element.top,
                    fill: element.fill || "#000000",
                    stroke: element.stroke || "#000000",
                    strokeWidth: element.strokeWidth || 1,
                    objectId: element.objectId,
                  } as fabric.IPathOptions);
                }
              default:
                break;
            }
            if (fabricObject) {
              fabricRef.current!.add(fabricObject);
              // Ahora solo llamamos a syncShapeInStorage, que ya hace la sincronización de capas
              syncShapeInStorage(fabricObject);
              // Ya no es necesario llamar explícitamente a handleAddObjectToLayers
              // handleAddObjectToLayers(fabricObject); <- ELIMINAR ESTA LÍNEA
            }
          } catch (error) {
            console.error(`Error al crear objeto ${element.type}:`, error);
          }
        });

        // Renderizar el canvas
        fabricRef.current!.renderAll();

        // Limpiar localStorage después de cargar los objetos
        localStorage.removeItem("importedSketchObjects");
      } catch (error) {
        console.error("Error loading imported objects:", error);
      }
    };
    loadProjectObjects();
  }, [projectId, syncShapeInStorage]); // Ya no dependemos de handleAddObjectToLayers

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
      });
    });

    canvas.on("mouse:move", (options) => {
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });

    canvas.on("mouse:up", (options) => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef,
      });

      // Ya no es necesario llamar explícitamente a handleAddObjectToLayers
      // Si se acaba de crear un objeto, ya se sincronizó en handleCanvasMouseUp
      // if (shapeRef.current && !isDrawing.current) {
      //   handleAddObjectToLayers(shapeRef.current);
      // }
    });

    canvas.on("object:modified", (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    canvas.on("selection:created", (options: any) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on("object:scaling", (options: any) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
      });
    });

    canvas.on("path:created", (options) => {
      handlePathCreated({
        options,
        syncShapeInStorage,
      });

      // Ya no es necesario llamar explícitamente a handleAddObjectToLayers
      // Si se creó un path, ya se sincronizó en handlePathCreated
      // if (options.path) {
      //   handleAddObjectToLayers(options.path);
      // }
    });

    window.addEventListener("resize", () => {
      handleResize({ canvas: fabricRef.current });
    });

    window.addEventListener("keydown", (e) => {
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });
    });

    return () => {
      canvas.dispose();
    };
  }, []); // Ya no dependemos de handleAddObjectToLayers

  useEffect(() => {
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef,
    });

    // Después de renderizar el canvas, necesitamos reconstruir los grupos
    if (fabricRef.current && canvasObjects && layersMap) {
      // Primero encontramos todas las capas de tipo grupo
      const groupLayers: Array<{ id: string; layerData: any }> = [];
      for (const [layerId, layer] of layersMap.entries()) {
        if (layer.type === "group" && layer.objectId) {
          groupLayers.push({ id: layerId, layerData: layer });
        }
      }

      // Luego, para cada grupo, configuramos los objetos que contiene
      // para que sepan a qué grupo pertenecen
      groupLayers.forEach(({ id, layerData }) => {
        if (!layerData.childrenIds || layerData.childrenIds.length === 0)
          return;

        // Buscar el objeto de grupo en el canvas
        const groupObj = fabricRef
          .current!.getObjects()
          .find((obj) => (obj as any).objectId === layerData.objectId);

        if (groupObj && groupObj instanceof fabric.Group) {
          // Para cada hijo, marcar su relación con este grupo
          layerData.childrenIds.forEach((childId: string) => {
            const childLayer = layersMap.get(childId);
            if (childLayer && childLayer.objectId) {
              // Encontrar el objeto hijo
              const childObj = fabricRef
                .current!.getObjects()
                .find((obj) => (obj as any).objectId === childLayer.objectId);

              if (childObj) {
                // Establecer relación entre el hijo y el grupo
                (childObj as any)._groupId = layerData.objectId;

                // Los objetos en grupos no deberían estar visibles directamente
                childObj.visible = false;
              }
            }
          });
        }
      });

      // Renderizar nuevamente el canvas
      fabricRef.current.renderAll();
    }
  }, [canvasObjects, layersMap]);

  // Nuevo efecto para inicializar y sincronizar las capas cuando se cargan los objetos del canvas
  useEffect(() => {
    if (canvasObjects && !layersInitialized) {
      // Solo tratamos de inicializar una vez que tenemos objetos del canvas
      if (canvasObjects.size > 0) {
        ensureLayersInitialized();
        setLayersInitialized(true);
      }
    }
  }, [canvasObjects, layersInitialized, ensureLayersInitialized]);

  return (
    <main className='h-screen overflow-hidden'>
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageInputRef}
        handleImageUpload={(e: any) => {
          e.stopPropagation();

          handleImageUpload({
            file: e.target.files[0],
            canvas: fabricRef as any,
            shapeRef,
            syncShapeInStorage,
          });
        }}
      />
      <section className='flex h-full flex-row'>
        <LeftSidebar
          fabricRef={fabricRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
        <Live canvasRef={canvasRef} undo={undo} redo={redo} />
        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
}
