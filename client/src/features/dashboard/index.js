// src/features/dashboard/index.js
// Barrel file for the dashboard feature

// Components
export { default as DashboardLayout } from './components/DashboardLayout';
export { default as Sidebar } from './components/Sidebar';
export { default as Navbar } from './components/Navbar';

// Pages
export { default as DashboardPage } from './pages/DashboardPage';
export { default as IslamicHomePage } from './pages/IslamicHomePage';

// Hooks
export { default as useDashboardState } from './hooks/useDashboardState';
export { useLocation } from './hooks/useLocation';
export { useSettings } from './hooks/useSettings';
export { usePrayerTimes } from './hooks/usePrayerTimes';
export { useIslamicDate } from './hooks/useIslamicDate';

// Context
export { DashboardProvider, useDashboard } from './contexts/DashboardContext';

// Helpers
export * from './helpers';

// Constants
export * from './constants';

// Services
export * from './services/dashboardService'; 