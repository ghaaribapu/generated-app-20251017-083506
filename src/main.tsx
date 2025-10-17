import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { DashboardLayout } from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import StudentsPage from '@/pages/StudentsPage';
import StudentDetailPage from '@/pages/StudentDetailPage';
import InstructorsPage from '@/pages/InstructorsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import FinancePage from '@/pages/FinancePage';
import CalendarPage from '@/pages/CalendarPage';
import CollaborationPage from '@/pages/CollaborationPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "courses/:courseId", element: <CourseDetailPage /> },
      { path: "students", element: <StudentsPage /> },
      { path: "students/:studentId", element: <StudentDetailPage /> },
      { path: "instructors", element: <InstructorsPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "finance", element: <FinancePage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "collaboration", element: <CollaborationPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);
const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>
);