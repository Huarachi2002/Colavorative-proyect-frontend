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
  const [loadingImported, setLoadingImported] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<String | null>("rectangle");
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const canvasObjects = useStorage((root) => root.canvasObjects);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);

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
  }, []);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");

    if (!canvasObjects || canvasObjects.size === 0) return true;

    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }

    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);
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

  const loadImportedFabricObjects = async (
    canvas: fabric.Canvas,
    objects: any[],
    syncShapeInStorage: any
  ) => {
    if (!canvas || !objects || !objects.length) return;

    // Necesitamos crear un evento de puntero simulado para cada objeto
    objects.forEach((obj) => {
      try {
        const simulatedPointer = {
          x: obj.left || 0,
          y: obj.top || 0,
        } as unknown as PointerEvent;

        let fabricObject: fabric.Object | null = null;

        switch (obj.type) {
          case "rectangle":
            fabricObject = createRectangle(simulatedPointer);
            if (fabricObject) {
              fabricObject.set({
                width: obj.width || 100,
                height: obj.height || 100,
                fill: obj.fill || "#aabbcc",
              } as fabric.IRectOptions);
            }
            break;

          case "triangle":
            fabricObject = createTriangle(simulatedPointer);
            if (fabricObject) {
              fabricObject.set({
                width: obj.width || 100,
                height: obj.height || 100,
                fill: obj.fill || "#aabbcc",
              } as fabric.ITriangleOptions);
            }
            break;

          case "circle":
            fabricObject = createCircle(simulatedPointer);
            if (fabricObject) {
              fabricObject.set({
                radius: obj.radius || 50,
                fill: obj.fill || "#aabbcc",
              } as fabric.ICircleOptions);
            }
            break;

          case "line":
            fabricObject = createLine(simulatedPointer);
            if (fabricObject && obj.points && obj.points.length === 4) {
              fabricObject.set({
                x1: obj.points[0],
                y1: obj.points[1],
                x2: obj.points[2],
                y2: obj.points[3],
                stroke: obj.stroke || "#aabbcc",
              } as fabric.ILineOptions);
            }
            break;

          case "text":
            fabricObject = createText(simulatedPointer, obj.text || "Texto");
            if (fabricObject) {
              fabricObject.set({
                fill: obj.fill || "#aabbcc",
                fontFamily: obj.fontFamily || "Helvetica",
                fontSize: obj.fontSize || 36,
                fontWeight: obj.fontWeight || "400",
              } as fabric.ITextOptions);
            }
            break;
        }

        if (fabricObject) {
          canvas.add(fabricObject);
          syncShapeInStorage(fabricObject);
        }
      } catch (error) {
        console.error(`Error al cargar objeto ${obj.type}:`, error);
      }
    });

    canvas.renderAll();
  };

  useEffect(() => {
    if (!fabricRef.current) return;

    const loadProjectObjects = async () => {
      try {
        setLoadingImported(true);

        // Verificar si hay objetos importados en localStorage
        const importedObjectsStr = localStorage.getItem(
          "importedSketchObjects"
        );
        if (!importedObjectsStr) return;

        // Parsear los objetos importados
        const importedObjects = JSON.parse(importedObjectsStr);
        if (!importedObjects || !importedObjects.length) return;

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
              default:
                break;
            }
            if (fabricObject) {
              fabricRef.current!.add(fabricObject);
              syncShapeInStorage(fabricObject);
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
      } finally {
        setLoadingImported(false);
      }
    };
    loadProjectObjects();
  }, [projectId, syncShapeInStorage]);

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
  }, []);

  useEffect(() => {
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef,
    });
  }, [canvasObjects]);

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
          allShapes={canvasObjects ? Array.from(canvasObjects) : []}
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
