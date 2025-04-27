import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { PrayerLogProvider } from "./features/prayer/hooks/usePrayerLog.jsx";
import { AuthProvider, useAuth } from "./features/auth/hooks/useAuth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/main-layout";
import { IslamicHomePage } from "./pages/islamic-home-page";
import { PrayerDashboardPage } from "./pages/prayer-dashboard-page";
import { TaskDashboardPage } from "./pages/task-dashboard-page";
import { MyProfilePage } from "./pages/my-profile-page";
import { WelcomePage } from "./pages/welcome-page";
import { LoginPage } from "./pages/login-page";
import { RegisterPage } from "./pages/register-page";

// Create a separate component for routes that need auth context
function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {isAuthenticated ? (
          <>
            <Route index element={<IslamicHomePage />} />
            <Route path="dashboard" element={<IslamicHomePage />} />
            <Route path="prayer" element={<PrayerDashboardPage />} />
            <Route path="tasks" element={<TaskDashboardPage />} />
            <Route path="profile" element={<MyProfilePage />} />
          </>
        ) : (
          <>
            <Route index element={<WelcomePage />} />
            <Route
              path="dashboard"
              element={<Navigate to="/" replace />}
            />
            <Route
              path="prayer"
              element={<Navigate to="/" replace />}
            />
            <Route
              path="tasks"
              element={<Navigate to="/" replace />}
            />
            <Route
              path="profile"
              element={<Navigate to="/" replace />}
            />
          </>
        )}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <PrayerLogProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster />
            </BrowserRouter>
          </AuthProvider>
        </PrayerLogProvider>
      </ThemeProvider>
    </>
  );
} 