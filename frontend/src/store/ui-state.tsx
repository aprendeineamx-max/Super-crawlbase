import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateCreator } from "zustand";
import { Profile } from "@/lib/api-client";

type UiState = {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
};

const createUiState: StateCreator<UiState, [], [], UiState> = (set) => ({
  activeProfile: null,
  setActiveProfile: (profile: Profile) => {
    set({ activeProfile: profile });
  },
});

export const useUiState = create<UiState>()(
  persist(
    createUiState,
    {
      name: "crawlbase-active-profile",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeProfile: state.activeProfile }),
    }
  )
);

