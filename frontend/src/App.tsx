import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CheckinPage } from './pages/CheckinPage';
import { BarrierResultPage } from './pages/BarrierResultPage';
import { LightModePage } from './pages/LightModePage';
import { RecoveryModePage } from './pages/RecoveryModePage';
import { RescueModePage } from './pages/RescueModePage';
import { SafetyPausePage } from './pages/SafetyPausePage';
import { RecoveryDashboardPage } from './pages/RecoveryDashboardPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLandingOrSign = location.pathname === '/' || location.pathname === '/signin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Demo Banner for Hackathon Evaluators */}
      <DemoBanner />

      {/* Main Navbar (shown on authenticated / app views) */}
      {!isLandingOrSign && <Navbar />}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/checkin" element={<CheckinPage />} />
          <Route path="/barrier-result" element={<BarrierResultPage />} />
          <Route path="/mode/light" element={<LightModePage />} />
          <Route path="/mode/recovery" element={<RecoveryModePage />} />
          <Route path="/mode/rescue" element={<RescueModePage />} />
          <Route path="/mode/safety" element={<SafetyPausePage />} />
          <Route path="/recovery-dashboard" element={<RecoveryDashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        Revive Motion • Dual-Mode Fitness Continuity & Recovery • Internal Hackathon Prototype
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
