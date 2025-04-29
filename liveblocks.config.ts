import { createClient, LiveMap, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { Layer, ReactionEvent } from "./types/type";

// Determinar el entorno actual
const isDevelopment = process.env.NODE_ENV === "development";

// Configurar el cliente con la clave apropiada según el entorno
const client = createClient({
  publicApiKey: isDevelopment
    ? process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!
    : process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY_PRODUCTION!,
});

// Ejemplo de tipados del estado compartido
export type Presence = {
  cursor: { x: number; y: number } | null;
  cursorColor: string | null;
  message: string | null;
};

// Modificación para una estructura más compatible con Liveblocks
type Storage = {
  canvasObjects: LiveMap<string, any>;
  // Usar LiveMap para almacenar las capas individualmente por ID
  layers: LiveMap<string, Omit<Layer, "children"> & { childrenIds: string[] }>;
  // Mantener la estructura de selección y jerarquía por separado
  layerStructure: LiveObject<{
    rootLayerIds: string[]; // IDs de las capas raíz
    selectedLayerIds: string[]; // IDs de capas seleccionadas
  }>;
};

type UserMeta = {
  id: string;
  info: {
    name: string;
    email: string;
    avatar: string;
  };
};

type RoomEvent = ReactionEvent;
export type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
};

// Configuración de la sala (Room) sin las opciones que se han movido a createClient
export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useUser,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(
  client
);
