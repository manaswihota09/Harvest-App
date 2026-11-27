import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HarvestIQProvider } from './context/HarvestIQContext';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { FarmsPage } from './pages/FarmsPage';
import { ZonesPage } from './pages/ZonesPage';
import { BatchesPage } from './pages/BatchesPage';
import { BatchDetailPage } from './pages/BatchDetailPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { DevicesPage } from './pages/DevicesPage';
import { PartnersPage } from './pages/PartnersPage';
import { HarvestPage } from './pages/HarvestPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <HarvestIQProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <AppShell>
                <DashboardPage />
              </AppShell>
            }
          />
          <Route
            path="/farms"
            element={
              <AppShell>
                <FarmsPage />
              </AppShell>
            }
          />
          <Route
            path="/zones"
            element={
              <AppShell>
                <ZonesPage />
              </AppShell>
            }
          />
          <Route
            path="/batches"
            element={
              <AppShell>
                <BatchesPage />
              </AppShell>
            }
          />
          <Route
            path="/batches/:id"
            element={
              <AppShell>
                <BatchDetailPage />
              </AppShell>
            }
          />
          <Route
            path="/predictions"
            element={
              <AppShell>
                <PredictionsPage />
              </AppShell>
            }
          />
          <Route
            path="/environment"
            element={
              <AppShell>
                <EnvironmentPage />
              </AppShell>
            }
          />
          <Route
            path="/devices"
            element={
              <AppShell>
                <DevicesPage />
              </AppShell>
            }
          />
          <Route
            path="/partners"
            element={
              <AppShell>
                <PartnersPage />
              </AppShell>
            }
          />
          <Route
            path="/harvest"
            element={
              <AppShell>
                <HarvestPage />
              </AppShell>
            }
          />
          <Route
            path="/alerts"
            element={
              <AppShell>
                <AlertsPage />
              </AppShell>
            }
          />
          <Route
            path="/analytics"
            element={
              <AppShell>
                <AnalyticsPage />
              </AppShell>
            }
          />
          <Route
            path="/settings"
            element={
              <AppShell>
                <SettingsPage />
              </AppShell>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HarvestIQProvider>
  );
}
