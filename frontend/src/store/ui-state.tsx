import { create } from "zustand";
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

export const useUiState = create<UiState>(createUiState);

