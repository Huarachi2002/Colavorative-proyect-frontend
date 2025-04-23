"use client";

import Loader from "@/components/Loader";
import { RoomProvider } from "@/liveblocks.config";
import { LiveMap } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import { ReactNode } from "react";

export default function Room({
  children,
  projectId,
}: {
  children: ReactNode;
  projectId: string;
}) {
  const roomId = `project-${projectId}`;

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        cursorColor: null,
        message: null,
      }}
      initialStorage={{
        canvasObjects: new LiveMap(),
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
