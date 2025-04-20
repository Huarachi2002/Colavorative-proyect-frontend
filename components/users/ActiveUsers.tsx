"use client";

import { useMemo } from "react";

import { useOthers, useSelf } from "@/liveblocks.config";

import styles from "./index.module.css";

import { generateRandomName } from "@/lib/utils";
import { Avatar } from "./Avatar";

const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();

  const hasMoreUsers = users.length > 3;

  const memorizedUsers = useMemo(() => {
    return (
      <div className='flex items-center justify-center gap-1 py-2'>
        <div className='flex pl-3'>
          {currentUser && (
            <Avatar name='Yo' otherStyles='border-[3px] border-primary-green' />
          )}

          {users.slice(0, 3).map(({ connectionId, info }) => {
            return (
              <Avatar
                key={connectionId}
                name={info.avatar} //TODO: use a better name
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
  }, [users.length]);

  return memorizedUsers;
};

export default ActiveUsers;
