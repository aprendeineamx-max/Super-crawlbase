import React, { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api, DashboardUsage } from "@/lib/api-client";
import { useUiState } from "@/store/ui-state";

type HookResult = {
  data: DashboardUsage | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refresh: () => void;
  activeProfile: ReturnType<typeof useUiState>["activeProfile"];
};

export const useUsageSnapshot = (): HookResult => {
  const { activeProfile } = useUiState();
  const [refreshCounter, setRefreshCounter] = useState(0);

  const query = useQuery({
    queryKey: ["usage", activeProfile?.id, refreshCounter],
    queryFn: async () => {
      if (!activeProfile) throw new Error("NO_PROFILE");
      const forceRefresh = refreshCounter > 0;
      return api.dashboard.usage(activeProfile.id, {
        includePrevious: true,
        forceRefresh,
      });
    },
    enabled: !!activeProfile,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const refresh = useCallback(() => setRefreshCounter((value) => value + 1), []);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refresh,
    activeProfile,
  };
};

