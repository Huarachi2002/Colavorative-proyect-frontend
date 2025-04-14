import React, { useCallback, useEffect, useState } from "react";
import LiveCursors from "./cursor/LiveCursors";
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
} from "@/liveblocks.config";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import useInterval from "@/hooks/useInterval";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@radix-ui/react-context-menu";
import { shortcuts } from "@/constants";

type Props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {
  const [{ cursor }, updateMyPresence] = useMyPresence();

  const [cursorState, setcursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const [reaction, setReaction] = useState<Reaction[]>([]);

  const broadcast = useBroadcastEvent();

  // useInterval(() => {
  //   if (
  //     cursorState.mode === CursorMode.Reaction &&
  //     cursorState.isPressed &&
  //     cursor
  //   ) {
  //     setReaction((reaction) =>
  //       reaction.concat([
  //         {
  //           point: { x: cursor.x, y: cursor.y },
  //           value: cursorState.reaction,
  //           timestamp: Date.now(),
  //         },
  //       ])
  //     );

  //     broadcast({
  //       x: cursor.x,
  //       y: cursor.y,
  //       value: cursorState.reaction,
  //     });
  //   }
  // }, 100);

  // useEventListener((eventData) => {
  //   const event = eventData.event as ReactionEvent;

  //   setReaction((reactions) =>
  //     reactions.concat([
  //       {
  //         point: { x: cursor.x, y: cursor.y },
  //         value: event.value,
  //         timestamp: Date.now(),
  //       },
  //     ])
  //   );
  // });

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      if (!cursor || cursor.x !== x || cursor.y !== y) {
        updateMyPresence({ cursor: { x, y } });
      }
    }
  }, []);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    setcursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({ cursor: { x, y } });

      setcursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [updateMyPresence]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      setcursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: false }
          : state
      );
    },
    [setcursorState]
  );

  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case "Chat":
        setcursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
        break;
      case "Deshacer":
        undo();
        break;
      case "Rehacer":
        redo();
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setcursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({
          message: "",
        });
        setcursorState({
          mode: CursorMode.Hidden,
        });
      }
      // else if (e.key === "e") {
      //   setcursorState({
      //     mode: CursorMode.ReactionSelector,
      //   });
      // }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const setReactions = useCallback((reaction: string) => {
    setcursorState({
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false,
    });
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id='canvas'
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className='context relative flex h-full w-full flex-1 items-center justify-center'
      >
        <canvas ref={canvasRef} />

        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setcursorState}
            updateMyPresence={updateMyPresence}
          />
        )}

        {/* {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector setReaction={setReactions} />
        )} */}

        <LiveCursors />
      </ContextMenuTrigger>
      <ContextMenuContent className='rigth-menu-content w-40'>
        {shortcuts.map((item) => (
          <ContextMenuItem
            key={item.key}
            onClick={() => handleContextMenuClick(item.name)}
            className='right-menu-item'
          >
            <p className='text-xs text-primary-grey-300'>{item.name}</p>
            <p className='text-xs text-primary-grey-300'>{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;
