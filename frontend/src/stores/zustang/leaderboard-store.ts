import type { LeaderboardSnapshot } from "@/api/leaderboard/types";

import { create } from "zustand";

type LeaderboardState = {
  snapshots: Record<number, LeaderboardSnapshot | null>;
};

type LeaderboardActions = {
  setSnapshot: (limit: number, snapshot: LeaderboardSnapshot) => void;
  clearSnapshot: (limit?: number) => void;
};

export type LeaderboardStore = LeaderboardState & LeaderboardActions;

function createInitialState(): LeaderboardState {
  return { snapshots: {} };
}

export const useLeaderboardStore = create<LeaderboardStore>((set) => ({
  ...createInitialState(),
  setSnapshot: (limit, snapshot) =>
    set((state) => ({
      snapshots: {
        ...state.snapshots,
        [limit]: {
          ...snapshot,
          entries: snapshot.entries.slice(0, limit),
        },
      },
    })),
  clearSnapshot: (limit) =>
    set((state) => {
      if (typeof limit === "number") {
        const snapshots = { ...state.snapshots };
        delete snapshots[limit];
        return { snapshots };
      }

      return createInitialState();
    }),
}));
