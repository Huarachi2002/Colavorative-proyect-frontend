import React, { useMemo, useRef } from "react";

import { RightSidebarProps } from "@/types/type";
import { bringElement, modifyShape } from "@/lib/shapes";

import Text from "./settings/Text";
import Color from "./settings/Color";
import Export from "./settings/Export";
import Dimensions from "./settings/Dimensions";
import { Camera, LibraryIcon, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import LibraryPanel from "./GraphicLibrary/LibraryPanel";
import { syncShapeToLiveblocks } from "@/lib/canvas";
import { useStorage } from "@/liveblocks.config";

const RightSidebar = ({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage,

  activeTab,
  setActiveTab,
}: RightSidebarProps) => {
  // Manejar el cambio de pestaña internamente si no se proporciona setActiveTab
  const handleTabChange = (value: string) => {
    if (setActiveTab) {
      setActiveTab(value);
    }
  };

  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;

    setElementAttributes((prev) => ({ ...prev, [property]: value }));

    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage,
    });
  };

  // memoize the content of the right sidebar to avoid re-rendering on every mouse actions
  const memoizedContent = useMemo(
    () => (
      <section className='sticky right-0 flex h-full min-w-[227px] select-none flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 max-sm:hidden'>
        <h3 className=' px-5 pt-4 text-xs uppercase'>Design</h3>
        <span className='mt-3 border-b border-primary-grey-200 px-5 pb-4 text-xs text-primary-grey-300'>
          Diseño de cada objeto seleccionado
        </span>

        <Tabs
          defaultValue='Edit'
          className='w-full'
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <TabsList className='mb-4 flex h-[40px] w-full flex-row items-center justify-between gap-2 bg-primary-black text-primary-grey-300'>
            <TabsTrigger
              value='Edit'
              className='flex-1 pb-4 data-[state=active]:text-white'
            >
              <Settings className='h-5 w-5' />
            </TabsTrigger>

            <TabsTrigger
              value='Library'
              className='flex-1 pb-4 data-[state=active]:text-white'
            >
              <LibraryIcon className='h-5 w-5' />
            </TabsTrigger>
          </TabsList>

          <TabsContent value='Edit' className='h-full'>
            <Dimensions
              isEditingRef={isEditingRef}
              width={elementAttributes.width}
              height={elementAttributes.height}
              handleInputChange={handleInputChange}
            />

            <Text
              fontFamily={elementAttributes.fontFamily}
              fontSize={elementAttributes.fontSize}
              fontWeight={elementAttributes.fontWeight}
              handleInputChange={handleInputChange}
            />

            <Color
              inputRef={colorInputRef}
              attribute={elementAttributes.fill}
              placeholder='color'
              attributeType='fill'
              handleInputChange={handleInputChange}
            />

            <Color
              inputRef={strokeInputRef}
              attribute={elementAttributes.stroke}
              placeholder='stroke'
              attributeType='stroke'
              handleInputChange={handleInputChange}
            />
          </TabsContent>

          <TabsContent value='Library' className='h-[calc(100vh-200px)]'>
            <LibraryPanel
              fabricRef={fabricRef}
              syncShapeInStorage={(object) => {
                // Primero sincronizamos con Liveblocks
                const canvasObjects = useStorage.getState("canvasObjects");
                if (canvasObjects) {
                  syncShapeToLiveblocks(object, canvasObjects);
                }
                // Luego llamamos a la función de sincronización del componente padre
                syncShapeInStorage(object);
              }}
            />
          </TabsContent>
        </Tabs>

        <Export />
      </section>
    ),
    [elementAttributes, activeTab, handleInputChange, fabricRef, syncShapeInStorage]
  ); // re-render when elementAttributes or activeTab changes

  return memoizedContent;
};

export default RightSidebar;
