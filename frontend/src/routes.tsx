import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";
import { DashboardPage } from "@/pages/dashboard-page";
import { ProjectsPage } from "@/pages/projects-page";
import { DocumentationPage } from "@/pages/documentation-page";
import { ScrapersPage } from "@/pages/scrapers-page";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "scrapers",
        element: <ScrapersPage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "profiles/new",
        element: <ProfileCreatePage />,
      },
      {
        path: "docs",
        element: <DocumentationPage />,
      },
    ],
  },
]);

