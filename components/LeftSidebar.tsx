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
      console.log("============== toggleLayerVisibility ===========");
      // Obtener la capa directamente del mapa de capas
      const layersMap = storage.get("layers");
      console.log("LayerMap", layersMap);
      const layer = layersMap.get(layerId);
      console.log("layer", layer);

      if (layer) {
        const visible = !layer.visible;
        console.log("layer.visible", layer.visible);
        // Actualizar la visibilidad de la capa
        layersMap.set(layerId, {
          ...layer,
          visible,
        });

        for (const childId of layer.childrenIds || []) {
          const childLayer = layersMap.get(childId);
          if (childLayer) {
            layersMap.set(childId, {
              ...childLayer,
              visible,
            });
          }
        }

        // Si hay un canvas y un objeto asociado, actualizar su visibilidad
        console.log("fabricRef.current", fabricRef.current);
        if (fabricRef.current) {
          const objectId = layer.objectId;
          console.log("objectId", objectId);
          if (objectId) {
            const object = findObjectById(fabricRef.current, objectId);
            console.log("object", object);
            if (object) {
              object.visible = visible;
              if (object._objects) {
                for (const child of object._objects) {
                  console.log("child", child);
                  child.visible = visible;
                  syncShapeInStorage(child);
                }
              }
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

  const multiSelectLayer = useMutation(
    ({ storage }, layerId: string, event: React.MouseEvent) => {
      const layerStructure = storage.get("layerStructure");
      let selectedLayerIds = [...layerStructure.get("selectedLayerIds")];

      // Si se mantiene la tecla Ctrl o Command (Mac), permitir selección múltiple
      if (event.ctrlKey || event.metaKey) {
        // Si ya está seleccionado, lo quitamos
        if (selectedLayerIds.includes(layerId)) {
          selectedLayerIds = selectedLayerIds.filter((id) => id !== layerId);
        } else {
          // Si no está seleccionado, lo añadimos
          selectedLayerIds.push(layerId);
        }
      } else {
        // Seleccionar solo esta capa si no se presiona Ctrl/Command
        selectedLayerIds = [layerId];
      }

      // Actualizar la selección
      layerStructure.update({
        selectedLayerIds,
      });

      // Si hay un canvas y estamos seleccionando un solo objeto, seleccionarlo también en el canvas
      if (fabricRef.current && selectedLayerIds.length === 1) {
        const layer = layersMap.get(layerId);

        if (layer && layer.objectId) {
          const object = findObjectById(fabricRef.current, layer.objectId);
          if (object) {
            fabricRef.current.discardActiveObject();
            fabricRef.current.setActiveObject(object);
            activeObjectRef.current = object;
            fabricRef.current.renderAll();
          }
        }
      } else if (fabricRef.current && selectedLayerIds.length > 1) {
        // Para múltiples selecciones, podemos crear una ActiveSelection en el canvas
        const objectsToSelect = [];

        for (const id of selectedLayerIds) {
          const layer = layersMap.get(id);
          if (layer && layer.objectId) {
            const object = findObjectById(fabricRef.current, layer.objectId);
            if (object) {
              objectsToSelect.push(object);
            }
          }
        }

        if (objectsToSelect.length > 0) {
          fabricRef.current.discardActiveObject();
          const selection = new fabric.ActiveSelection(objectsToSelect, {
            canvas: fabricRef.current,
          });
          fabricRef.current.setActiveObject(selection);
          fabricRef.current.requestRenderAll();
        }
      }
    },
    [fabricRef, activeObjectRef, layersMap]
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
        // Agregamos un pequeño retraso para asegurar que React haya actualizado el estado
        setTimeout(() => {
          if (fabricRef.current) {
            updateCanvasOrderFromLayers(fabricRef.current, {
              layerStructure: {
                rootLayerIds: layerStructure.get("rootLayerIds"),
                selectedLayerIds: layerStructure.get("selectedLayerIds"),
              },
              layersMap: storage.get("layers"),
            });
            fabricRef.current.renderAll();
          }
        }, 0);
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
        // Agregamos un pequeño retraso para asegurar que React haya actualizado el estado
        setTimeout(() => {
          if (fabricRef.current) {
            updateCanvasOrderFromLayers(fabricRef.current, {
              layerStructure: {
                rootLayerIds: layerStructure.get("rootLayerIds"),
                selectedLayerIds: layerStructure.get("selectedLayerIds"),
              },
              layersMap: storage.get("layers"),
            });
            fabricRef.current.renderAll();
          }
        }, 0);
      }
    },
    [fabricRef]
  );

  const createGroup = useMutation(
    ({ storage }) => {
      const layerStructure = storage.get("layerStructure");
      const selectedLayerIds = layerStructure.get("selectedLayerIds");
      const layersMap = storage.get("layers");

      // Necesitamos al menos 2 capas seleccionadas para crear un grupo
      if (selectedLayerIds.length < 2) {
        alert("Selecciona al menos 2 elementos para agrupar");
        return;
      }

      // Crear un nuevo grupo con ID único
      const groupId = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const objectId = `obj-${Date.now()}`;

      // Verificar que todos los elementos seleccionados tienen objetos correspondientes en el canvas
      const objectsToGroup = [];
      const validLayerIds: any[] = [];
      const validObjectIds = new Set();

      if (fabricRef.current) {
        for (const childId of selectedLayerIds) {
          const childLayer = layersMap.get(childId);
          if (childLayer && childLayer.objectId) {
            const object = findObjectById(
              fabricRef.current,
              childLayer.objectId
            );
            if (object) {
              objectsToGroup.push(object);
              validLayerIds.push(childId);
              validObjectIds.add(childLayer.objectId); // Registrar este objectId
            }
          }
        }

        // Si no hay suficientes objetos válidos, no podemos crear un grupo
        if (objectsToGroup.length < 2) {
          alert("No se encontraron suficientes objetos válidos para agrupar");
          return;
        }
      } else {
        // Si no hay canvas, solo usamos las capas seleccionadas
        validLayerIds.push(...selectedLayerIds);
      }

      // Añadir el grupo al mapa de capas
      layersMap.set(groupId, {
        id: groupId,
        name: "Grupo",
        type: "group",
        visible: true,
        locked: false,
        expanded: true,
        childrenIds: [...validLayerIds], // Los hijos son las capas seleccionadas
        objectId,
      });

      // Determinar dónde insertar el grupo (en la raíz o como hijo de otro grupo)
      const rootLayerIds = layerStructure.get("rootLayerIds");

      // Filtrar las capas raíz que no están en las seleccionadas
      const newRootLayerIds = rootLayerIds.filter(
        (id) => !validLayerIds.includes(id)
      );

      // Añadir el nuevo grupo a las capas raíz
      newRootLayerIds.push(groupId);

      layerStructure.update({
        rootLayerIds: newRootLayerIds,
        selectedLayerIds: [groupId], // Seleccionar el nuevo grupo
      });

      // Si estamos usando Fabric.js, también debemos agrupar los objetos
      if (fabricRef.current && objectsToGroup.length >= 2) {
        // Primero deseleccionamos cualquier objeto seleccionado actualmente
        fabricRef.current.discardActiveObject();

        // Creamos un grupo activo (activeSelection) con los objetos
        const selection = new fabric.ActiveSelection(objectsToGroup, {
          canvas: fabricRef.current,
        });

        // Lo convertimos en un grupo permanente
        const group = selection.toGroup();
        group.set("objectId", objectId);

        // IMPORTANTE: Los objetos dentro del grupo deben permanecer visibles
        // pero solo cuando están en el grupo (no como objetos individuales)
        objectsToGroup.forEach((obj) => {
          // Guardar la visibilidad original
          (obj as any)._originalVisible = obj.visible;
          obj.visible = true; // Los objetos en el grupo deben estar visibles
          // Marcar que este objeto ahora es parte de un grupo
          (obj as any)._groupId = objectId;
        });

        // Asegurarnos de que el grupo sea visible
        group.visible = true;

        // Actualizamos el canvas
        fabricRef.current.setActiveObject(group);
        fabricRef.current.requestRenderAll();

        // Añadir el nuevo grupo al almacenamiento
        const canvasObjects = storage.get("canvasObjects");
        const groupData = group.toObject(["objectId"]);
        canvasObjects.set(objectId, groupData);

        // Asegurar que los objetos individuales estén correctamente
        // asociados con el grupo en Liveblocks
        objectsToGroup.forEach((obj) => {
          const objId = (obj as any).objectId;
          if (objId) {
            const objData = canvasObjects.get(objId);
            if (objData) {
              objData._groupId = objectId;
              canvasObjects.set(objId, objData);
            }
          }
        });
      }
    },
    [fabricRef, syncShapeInStorage]
  );

  const ungroup = useMutation(
    ({ storage }) => {
      console.log("Iniciando desagrupación...");
      const layerStructure = storage.get("layerStructure");
      const selectedLayerIds = layerStructure.get("selectedLayerIds");
      const layersMap = storage.get("layers");
      const canvasObjects = storage.get("canvasObjects");

      // Solo podemos desagrupar si hay una capa seleccionada
      if (selectedLayerIds.length !== 1) {
        alert("Selecciona un grupo para desagrupar");
        return;
      }

      const layerId = selectedLayerIds[0];
      const layer = layersMap.get(layerId);

      // Solo podemos desagrupar grupos
      if (!layer || layer.type !== "group") {
        alert("El elemento seleccionado no es un grupo");
        return;
      }

      const childrenIds = layer.childrenIds || [];
      if (childrenIds.length === 0) {
        alert("Este grupo no contiene elementos");
        return;
      }

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
          selectedLayerIds: childrenIds, // Seleccionar los hijos
        });
        console.log("Capas hijas movidas a la raíz");
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
            console.log("Capas hijas movidas al grupo padre");
            break;
          }
        }
      }

      // CLAVE: Obtener la información del grupo antes de eliminarlo
      const groupObjectId = layer.objectId;
      const groupObjectData = canvasObjects.get(groupObjectId!);

      console.log(
        "Datos del grupo a desagrupar:",
        groupObjectId,
        !!groupObjectData
      );

      if (fabricRef.current && groupObjectId) {
        // Guardar los datos del grupo que necesitaremos
        let groupMatrix = null;
        let groupPosition = { left: 0, top: 0 };
        let groupTransforms = { scaleX: 1, scaleY: 1, angle: 0 };

        // Obtener datos del grupo de la versión almacenada
        if (groupObjectData) {
          groupPosition = {
            left: groupObjectData.left || 0,
            top: groupObjectData.top || 0,
          };
          groupTransforms = {
            scaleX: groupObjectData.scaleX || 1,
            scaleY: groupObjectData.scaleY || 1,
            angle: groupObjectData.angle || 0,
          };
        }

        // Buscar el grupo en el canvas (puede que ya no esté)
        const fabricGroup = findObjectById(fabricRef.current, groupObjectId);
        if (fabricGroup && fabricGroup instanceof fabric.Group) {
          // Si encontramos el grupo en el canvas, usamos sus valores actuales
          groupMatrix = fabricGroup.calcTransformMatrix();
          groupPosition = {
            left: fabricGroup.left || 0,
            top: fabricGroup.top || 0,
          };
          groupTransforms = {
            scaleX: fabricGroup.scaleX || 1,
            scaleY: fabricGroup.scaleY || 1,
            angle: fabricGroup.angle || 0,
          };

          // Eliminar el grupo del canvas
          fabricRef.current.remove(fabricGroup);
          console.log("Grupo eliminado del canvas");
        }

        // Para cada elemento hijo, actualizar su posición y visibilidad
        for (const childId of childrenIds) {
          const childLayer = layersMap.get(childId);
          if (!childLayer || !childLayer.objectId) continue;

          const childObjectId = childLayer.objectId;
          console.log(`Procesando hijo: ${childObjectId}`);

          // Obtener los datos del objeto hijo de Liveblocks
          const childObjectData = canvasObjects.get(childObjectId);
          if (!childObjectData) {
            console.log(
              `No se encontraron datos para el hijo: ${childObjectId}`
            );
            continue;
          }

          // Calcular la posición absoluta del objeto
          let newLeft = childObjectData.left;
          let newTop = childObjectData.top;

          // Si el objeto está dentro del grupo, sus coordenadas son relativas al grupo
          if (childObjectData._groupId === groupObjectId) {
            console.log(
              "El objeto está dentro del grupo, calculando posición absoluta"
            );

            // Si tenemos la matriz de transformación del grupo, usarla para calcular
            if (groupMatrix) {
              const relativePoint = new fabric.Point(
                childObjectData.left || 0,
                childObjectData.top || 0
              );
              const absolutePoint = fabric.util.transformPoint(
                relativePoint,
                groupMatrix
              );
              newLeft = absolutePoint.x;
              newTop = absolutePoint.y;
            } else {
              // Fallback: Calcular manualmente basado en la posición del grupo
              newLeft = (childObjectData.left || 0) + groupPosition.left;
              newTop = (childObjectData.top || 0) + groupPosition.top;
            }

            console.log(`Nueva posición: (${newLeft}, ${newTop})`);

            // Actualizar los datos del objeto en Liveblocks
            delete childObjectData._groupId; // Eliminar la referencia al grupo
            childObjectData.left = newLeft;
            childObjectData.top = newTop;
            childObjectData.visible = true; // Asegurar que el objeto sea visible

            // También aplicar la escala y rotación del grupo si es necesario
            childObjectData.scaleX =
              (childObjectData.scaleX || 1) * groupTransforms.scaleX;
            childObjectData.scaleY =
              (childObjectData.scaleY || 1) * groupTransforms.scaleY;
            childObjectData.angle =
              (childObjectData.angle || 0) + groupTransforms.angle;

            // Guardar los cambios en Liveblocks
            canvasObjects.set(childObjectId, childObjectData);
            console.log(`Objeto ${childObjectId} actualizado en Liveblocks`);
          }

          // Si el objeto existe en el canvas, actualizar sus propiedades
          const canvasObject = findObjectById(fabricRef.current, childObjectId);
          if (canvasObject) {
            console.log(
              "Objeto encontrado en el canvas, actualizando propiedades"
            );
            canvasObject.set({
              left: newLeft,
              top: newTop,
              visible: true,
              scaleX: childObjectData.scaleX,
              scaleY: childObjectData.scaleY,
              angle: childObjectData.angle,
            });
            delete (canvasObject as any)._groupId;
            canvasObject.setCoords();
          } else {
            // Si el objeto no existe en el canvas, recrearlo
            try {
              console.log("Recreando objeto en el canvas");
              fabric.util.enlivenObjects(
                [childObjectData],
                function (enlivenedObjects: any[]) {
                  const obj = enlivenedObjects[0];
                  if (obj) {
                    obj.set({
                      left: newLeft,
                      top: newTop,
                      visible: true,
                    });
                    fabricRef.current?.add(obj);
                    obj.setCoords();
                  }
                },
                "fabric"
              );
            } catch (err) {
              console.error("Error al recrear objeto:", err);
            }
          }
        }

        // Eliminar el grupo del almacenamiento de Liveblocks
        canvasObjects.delete(groupObjectId);
        console.log(`Grupo ${groupObjectId} eliminado de Liveblocks`);

        // Renderizar el canvas para mostrar los cambios
        fabricRef.current.requestRenderAll();
      }

      // Finalmente, eliminar el grupo del mapa de capas
      layersMap.delete(layerId);
      console.log("Grupo eliminado del mapa de capas");
      console.log("Desagrupación completada");
    },
    [fabricRef, syncShapeInStorage]
  );

  const deleteLayer = useMutation(
    ({ storage }, layerId: string) => {
      const layerStructure = storage.get("layerStructure");
      const canvasObjects = storage.get("canvasObjects");
      const layersMap = storage.get("layers");
      const layer = layersMap.get(layerId);
      console.log("======================== deleteLayer ====================");
      if (!layer) return;

      // Si es un grupo/contenedor, verificar si tiene hijos
      console.log("Layer: ", layer);
      if (layer.type === "group" && (layer.childrenIds?.length || 0) > 0) {
        const confirmDelete = confirm(
          "Este contenedor tiene elementos. ¿Desea eliminar también todos los elementos contenidos?"
        );
        if (!confirmDelete) {
          return; // Cancelar eliminación
        }

        // Si se confirma, eliminar recursivamente todos los hijos
        const deleteChildrenRecursively = (childrenIds: string[]) => {
          console.log("Eliminando hijos recursivamente: ", childrenIds);
          for (const childId of childrenIds) {
            console.log("Eliminando hijo: ", childId);
            const childLayer = layersMap.get(childId);

            console.log("childLayer: ", childLayer);
            if (!childLayer) continue;

            // Si el hijo es un grupo, eliminar sus hijos primero
            console.log("childLayer.type: ", childLayer.type);
            console.log("childLayer.childrenIds: ", childLayer.childrenIds);
            if (childLayer.type === "group" && childLayer.childrenIds?.length) {
              deleteChildrenRecursively(childLayer.childrenIds);
            }

            // Eliminar el objeto del canvas si existe
            console.log("childLayer.objectId: ", childLayer.objectId);
            console.log("fabricRef.current: ", fabricRef.current);
            if (fabricRef.current && childLayer.objectId) {
              const object = findObjectById(
                fabricRef.current,
                childLayer.objectId
              );

              console.log("object: ", object);
              if (object) {
                fabricRef.current.remove(object);
                console.log("Objeto eliminado del canvas");
                // También eliminar del mapa de objetos del canvas
                canvasObjects.delete(childLayer.objectId);
                console.log(
                  "Objeto eliminado del mapa de objetos (Liveblocks)"
                );
              }
            }

            // Eliminar la capa
            console.log("Eliminando capa: ", childId);
            layersMap.delete(childId);
          }
        };

        // Eliminar todos los hijos recursivamente
        console.log("Eliminando hijos de la capa: ", layer.childrenIds);
        deleteChildrenRecursively(layer.childrenIds);
      }

      // Eliminar el objeto del canvas si existe (para capas normales o grupos con objetos)
      if (fabricRef.current && layer.objectId) {
        const object = findObjectById(fabricRef.current, layer.objectId);
        if (object) {
          fabricRef.current.remove(object);
          fabricRef.current.renderAll();

          canvasObjects.delete(object.objectId);
        } else {
          // Si no hay objeto, eliminar del mapa de objetos de Liveblocks
          console.log("layer.objectId: ", layer.objectId);
          if (layer.objectId) {
            console.log("Eliminando objeto del mapa de objetos (Liveblocks)");
            canvasObjects.delete(layer.objectId);
          }
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
        console.log("Era hijo de otro grupo Layer: ", layersMap);
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
        console.log("LayerMap Before: ", layersMap);
        const objectId = layer.objectId;
        console.log("Era hijo de otro grupo object: ", canvasObjects);
        console.log("El hijo objectId: ", objectId);
        for (const [parentId, parentObject] of canvasObjects.entries()) {
          const childrens = parentObject.objects || [];
          // if (childrens.includes(objectId)) {
          if (
            childrens.some(
              (childObject: any) => childObject.objectId === objectId
            )
          ) {
            console.log("Era hijo de otro grupo object: ", parentObject);
            canvasObjects.set(parentId, {
              ...parentObject,
              objects: childrens.filter(
                (childObject: any) => childObject.objectId !== objectId
              ),
            });
            break;
          }
        }
        console.log("canvasObjects Before: ", canvasObjects);
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
    },
    [fabricRef]
  );

  // Nueva función para añadir un contenedor/carpeta en la estructura de capas
  const addContainer = useMutation(({ storage }) => {
    const layerStructure = storage.get("layerStructure");
    const layersMap = storage.get("layers");

    // Crear un nuevo contenedor con ID único
    const containerId = `container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Añadir el contenedor al mapa de capas
    layersMap.set(containerId, {
      id: containerId,
      name: "Nuevo Contenedor",
      type: "group", // Usamos type "group" para que se comporte como un grupo
      visible: true,
      locked: false,
      expanded: true,
      childrenIds: [], // Inicialmente vacío
    });

    // Añadir el contenedor a la raíz de la estructura de capas
    const rootLayerIds = layerStructure.get("rootLayerIds");
    layerStructure.update({
      rootLayerIds: [...rootLayerIds, containerId],
      selectedLayerIds: [containerId], // Seleccionar el nuevo contenedor
    });
  }, []);

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

      // Obtener información sobre la capa de origen y destino
      const sourceLayer = layersMap.get(sourceLayerId);
      const targetLayer = layersMap.get(targetLayerId);

      if (!sourceLayer) return;

      // Comprobación: no permitir arrastrar un grupo dentro de uno de sus propios hijos
      if (targetLayer && targetLayer.type === "group") {
        // Verificar recursivamente si el destino es un hijo del origen
        const isChildOfSource = (checkLayerId: string): boolean => {
          const checkLayer = layersMap.get(checkLayerId);
          if (!checkLayer) return false;

          // Si este es el origen, hemos encontrado un ciclo
          if (checkLayerId === sourceLayerId) return true;

          // Verificar el padre de este grupo
          for (const [parentId, parentLayer] of layersMap.entries()) {
            if (
              parentLayer.childrenIds &&
              parentLayer.childrenIds.includes(checkLayerId)
            ) {
              if (parentId === sourceLayerId) return true;
              return isChildOfSource(parentId);
            }
          }

          return false;
        };

        if (isChildOfSource(targetLayerId)) {
          alert("No puedes mover un grupo dentro de uno de sus propios hijos");
          return;
        }
      }

      // Encontrar dónde están las capas fuente y destino
      const rootLayerIds = layerStructure.get("rootLayerIds");
      const sourceInRoot = rootLayerIds.includes(sourceLayerId);
      const targetInRoot = rootLayerIds.includes(targetLayerId);

      // Si el destino es un grupo, añadir el origen como hijo
      if (targetLayer && targetLayer.type === "group") {
        // Primero, eliminar el origen de su ubicación actual
        if (sourceInRoot) {
          // Si la fuente está en la raíz, eliminarla de allí
          layerStructure.update({
            rootLayerIds: rootLayerIds.filter((id) => id !== sourceLayerId),
          });
        } else {
          // Si la fuente está en un grupo, buscar y eliminarla de allí
          for (const [parentId, parentLayer] of layersMap.entries()) {
            const childrenIds = parentLayer.childrenIds || [];
            if (childrenIds.includes(sourceLayerId)) {
              layersMap.set(parentId, {
                ...parentLayer,
                childrenIds: childrenIds.filter((id) => id !== sourceLayerId),
              });
              break;
            }
          }
        }

        // Ahora añadir la fuente como hijo del destino
        const targetChildrenIds = targetLayer.childrenIds || [];
        layersMap.set(targetLayerId, {
          ...targetLayer,
          childrenIds: [...targetChildrenIds, sourceLayerId],
          expanded: true, // Expandir automáticamente para ver el elemento añadido
        });

        // Si el objeto está en el canvas y el grupo también, actualizar las relaciones en el canvas
        if (fabricRef.current && sourceLayer.objectId && targetLayer.objectId) {
          const sourceObject = findObjectById(
            fabricRef.current,
            sourceLayer.objectId
          );
          const targetObject = findObjectById(
            fabricRef.current,
            targetLayer.objectId
          );

          if (
            sourceObject &&
            targetObject &&
            targetObject instanceof fabric.Group
          ) {
            // Marcar que el objeto ahora pertenece a este grupo
            (sourceObject as any)._groupId = targetLayer.objectId;

            // Actualizar la visualización si es necesario
            fabricRef.current.renderAll();
            syncShapeInStorage(sourceObject);
            syncShapeInStorage(targetObject);
          }
        }
      } else {
        // Si el destino no es un grupo, reordenar dentro del mismo nivel

        // Determinar si las capas están en el mismo nivel
        if (sourceInRoot && targetInRoot) {
          // Ambas están en la raíz, reordenar dentro de rootLayerIds
          const newRootLayerIds = [
            ...rootLayerIds.filter((id) => id !== sourceLayerId),
          ];
          const targetIndex = newRootLayerIds.indexOf(targetLayerId);

          // Insertar la capa fuente antes de la capa destino
          newRootLayerIds.splice(targetIndex, 0, sourceLayerId);

          // Actualizar la estructura de capas
          layerStructure.update({
            rootLayerIds: newRootLayerIds,
          });
        } else {
          // Buscar el grupo padre del destino
          for (const [parentId, parentLayer] of layersMap.entries()) {
            const childrenIds = parentLayer.childrenIds || [];
            if (childrenIds.includes(targetLayerId)) {
              // Primero, eliminar la fuente de su ubicación actual
              if (sourceInRoot) {
                // Si la fuente está en la raíz, eliminarla
                layerStructure.update({
                  rootLayerIds: rootLayerIds.filter(
                    (id) => id !== sourceLayerId
                  ),
                });
              } else {
                // Si la fuente está en un grupo, buscar y eliminarla
                for (const [
                  srcParentId,
                  srcParentLayer,
                ] of layersMap.entries()) {
                  const srcChildIds = srcParentLayer.childrenIds || [];
                  if (srcChildIds.includes(sourceLayerId)) {
                    layersMap.set(srcParentId, {
                      ...srcParentLayer,
                      childrenIds: srcChildIds.filter(
                        (id) => id !== sourceLayerId
                      ),
                    });
                    break;
                  }
                }
              }

              // Ahora añadir la fuente al mismo grupo que el destino, justo antes del destino
              const newChildrenIds = [...childrenIds];
              const targetIndex = newChildrenIds.indexOf(targetLayerId);
              newChildrenIds.splice(targetIndex, 0, sourceLayerId);

              layersMap.set(parentId, {
                ...parentLayer,
                childrenIds: newChildrenIds,
              });
              break;
            }
          }
        }
      }

      setDraggedLayer(null);

      // Actualizar el orden en el canvas
      if (fabricRef.current) {
        // Agregamos un pequeño retraso para asegurar que React haya actualizado el estado
        setTimeout(() => {
          if (fabricRef.current) {
            updateCanvasOrderFromLayers(fabricRef.current, {
              layerStructure: {
                rootLayerIds: layerStructure.get("rootLayerIds"),
                selectedLayerIds: layerStructure.get("selectedLayerIds"),
              },
              layersMap: storage.get("layers"),
            });
            fabricRef.current.renderAll();
          }
        }, 0);
      }
    },
    [fabricRef, syncShapeInStorage]
  );

  const renameLayer = useMutation(
    ({ storage }, layerId: string, newName: string) => {
      console.log("renameLayer", layerId, newName);
      const layersMap = storage.get("layers");
      const layer = layersMap.get(layerId);
      console.log("layer", layer);
      if (layer) {
        layersMap.set(layerId, {
          ...layer,
          name: newName,
        });

        console.log("layersMap", layersMap);
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
          onClick={(e) => multiSelectLayer(id, e)}
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

            {/* Eliminar capa */}
            <Button
              className='rounded p-1 hover:bg-gray-200 hover:text-red-500'
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`¿Estás seguro de eliminar la capa "${name}"?`)) {
                  deleteLayer(id);
                }
              }}
              title='Eliminar capa'
            >
              <span className='text-xs'>🗑️</span>
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
          onClick={() => addContainer()}
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
