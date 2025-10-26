"use client";

import type { LeaderboardSnapshot } from "../types";

import { useEffect } from "react";

import { env, leaderboardRealtimeSSEConfig } from "@/config";
import { useLeaderboardStore } from "@/stores/zustang";

const { sseEndpoint: LEADERBOARD_SSE_PATH, event: LEADERBOARD_EVENT_NAME } =
  leaderboardRealtimeSSEConfig;

let eventSource: EventSource | null = null;
let subscriberCount = 0;

function getEventSource(): EventSource | null {
  if (eventSource) {
    return eventSource;
  }

  const endpoint = new URL(LEADERBOARD_SSE_PATH, env.apiBaseUrl);

  const source = new EventSource(endpoint.toString(), { withCredentials: true });
  eventSource = source;

  return source;
}

function closeEventSource() {
  if (!eventSource) {
    return;
  }

  eventSource.close();
  eventSource = null;
}

export function useLeaderboardSseSubscription(limit: number) {
  const setSnapshot = useLeaderboardStore((state) => state.setSnapshot);
  const clearSnapshot = useLeaderboardStore((state) => state.clearSnapshot);

  useEffect(() => {
    const source = getEventSource();

    subscriberCount += 1;

    if (!source) {
      return () => {
        clearSnapshot(limit);
      };
    }

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const snapshot = JSON.parse(event.data) as LeaderboardSnapshot;
        setSnapshot(limit, snapshot);
      } catch (error) {
        console.error("Failed to parse leaderboard SSE payload", error);
      }
    };

    const handleError = (error: Event) => {
      console.error("Leaderboard SSE connection error", error);
    };

    source.addEventListener(LEADERBOARD_EVENT_NAME, handleMessage as EventListener);
    source.addEventListener("error", handleError as EventListener);

    return () => {
      source.removeEventListener(LEADERBOARD_EVENT_NAME, handleMessage as EventListener);
      source.removeEventListener("error", handleError as EventListener);

      subscriberCount = Math.max(0, subscriberCount - 1);
      if (subscriberCount === 0) {
        closeEventSource();
      }
      clearSnapshot(limit);
    };
  }, [clearSnapshot, limit, setSnapshot]);
}
