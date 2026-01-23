import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage.tsx";
import SignInPage from "../pages/auth/SignInPage.tsx";
import SignUpPage from "../pages/auth/SignUpPage.tsx";
import ProtectedPage from "../pages/ProtectedPage.tsx";
import NotFoundPage from "../pages/404Page.tsx";
import AuthProtectedRoute from "./AuthProtectedRoute.tsx";
import Providers from "../Providers.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";
import DocumentsListPage from "../pages/documents/DocumentsListPage.tsx";
import DocumentEditorPage from "../pages/documents/DocumentEditorPage.tsx";
import StudyMaterialsPage from "../pages/study/StudyMaterialsPage.tsx";
import StudyAssistantPage from "../pages/study/StudyAssistantPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Providers />,
    children: [
      // Public routes
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/auth/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/auth/sign-up",
        element: <SignUpPage />,
      },
      // Auth Protected routes
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/protected",
            element: <ProtectedPage />,
          },
          {
            path: "/documents",
            element: <DocumentsListPage />,
          },
          {
            path: "/documents/:id",
            element: <DocumentEditorPage />,
          },
          {
            path: "/study",
            element: <StudyMaterialsPage />,
          },
          {
            path: "/study/:id",
            element: <StudyAssistantPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
