import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import "@/styles/tailwind.css";
import { routes } from "@/routes";
import { ThemeProvider } from "@/store/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="crawlbase-theme">
        <RouterProvider router={routes} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

