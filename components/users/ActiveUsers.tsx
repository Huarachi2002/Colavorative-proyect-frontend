"use client";

import { useMemo } from "react";

import { useOthers, useSelf } from "@/liveblocks.config";

import styles from "./index.module.css";

import { Avatar } from "./Avatar";
import { useAuth } from "../providers/AuthProvider";

const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const { user } = useAuth();

  const hasMoreUsers = users.length > 3;

  const memorizedUsers = useMemo(() => {
    return (
      <div className='flex items-center justify-center gap-1 py-2'>
        <div className='flex pl-3'>
          {currentUser && (
            <Avatar
              src={
                currentUser.info?.avatar ||
                `https://avatar.vercel.sh/${currentUser.connectionId}`
              }
              name='Yo'
              otherStyles='border-[3px] border-primary-green'
            />
          )}

          {users.slice(0, 3).map(({ connectionId, info }) => {
            return (
              <Avatar
                key={connectionId}
                src={info?.avatar || `https://avatar.vercel.sh/${connectionId}`}
                name={info?.name || user?.name || "Usuario"}
                otherStyles='-ml-3'
              />
            );
          })}

          {hasMoreUsers && (
            <div className={styles.more}>+{users.length - 3}</div>
          )}
        </div>
      </div>
    );
  }, [users, currentUser, user, hasMoreUsers]);

  return memorizedUsers;
};

export default ActiveUsers;
