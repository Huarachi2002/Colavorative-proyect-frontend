"use client";

import { RoomProvider } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import { Loader } from "lucide-react";
import { ReactNode } from "react";

export default function Room({
  children,
  projectId,
}: {
  children: ReactNode;
  projectId: string;
}) {
  return (
    <RoomProvider
      id={`${projectId}`}
      initialPresence={{
        cursor: null,
        message: null,
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
