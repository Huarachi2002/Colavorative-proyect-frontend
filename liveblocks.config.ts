import { createClient, LiveMap } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { ReactionEvent } from "./types/type";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  async resolveUsers({ userIds }) {
    // Lógica para devolver info de usuarios
    return [];
  },
  async resolveMentionSuggestions({ text, roomId }) {
    // Lógica para devolver sugerencias de menciones
    return [];
  },
});

// Ejemplo de tipados del estado compartido
export type Presence = {
  cursor: { x: number; y: number } | null;
  cursorColor: string | null;
  message: string | null;
};
type Storage = {
  canvasObjects: LiveMap<string, any>;
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
