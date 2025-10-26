"use client";

import type { LeaderboardSnapshot } from "../types";

import { useEffect } from "react";

import { io, type Socket } from "socket.io-client";

import { env, leaderboardRealtimeConfig } from "@/config";
import { useLeaderboardStore } from "@/stores/zustang";

const {
  namespace: SOCKET_NAMESPACE,
  path: SOCKET_PATH,
  event: SOCKET_EVENT,
} = leaderboardRealtimeConfig;

let socket: Socket | null = null;
let subscriberCount = 0;

function getSocket(): Socket {
  socket ??= io(`${env.apiBaseUrl}${SOCKET_NAMESPACE}`, {
    path: SOCKET_PATH,
    transports: ["websocket", "polling"],
    withCredentials: true,
  });

  return socket;
}

export function useLeaderboardSubscription(limit: number) {
  const setSnapshot = useLeaderboardStore((state) => state.setSnapshot);
  const clearSnapshot = useLeaderboardStore((state) => state.clearSnapshot);

  useEffect(() => {
    const instance = getSocket();
    subscriberCount += 1;

    const handleSnapshot = (snapshot: LeaderboardSnapshot) => {
      setSnapshot(limit, snapshot);
    };

    instance.on(SOCKET_EVENT, handleSnapshot);

    return () => {
      instance.off(SOCKET_EVENT, handleSnapshot);
      subscriberCount = Math.max(0, subscriberCount - 1);
      if (subscriberCount === 0) {
        instance.disconnect();
        socket = null;
      }
      clearSnapshot(limit);
    };
  }, [clearSnapshot, limit, setSnapshot]);
}
