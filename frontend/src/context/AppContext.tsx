import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { DashboardSummary } from '../types';

interface AppContextType {
  summary: DashboardSummary | null;
  loading: boolean;
  refreshSummary: () => Promise<void>;
  loadDemoDay: (day: number) => Promise<void>;
  resetDemoData: () => Promise<void>;
  bannerAlert: string | null;
  setBannerAlert: (msg: string | null) => void;
  activeDemoDay: number;
  setActiveDemoDay: (d: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);
  const [activeDemoDay, setActiveDemoDay] = useState<number>(1);

  const refreshSummary = useCallback(async () => {
    try {
      const data = await apiClient.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  const loadDemoDay = async (day: number) => {
    setLoading(true);
    try {
      await apiClient.loadDemo(day);
      setActiveDemoDay(day);
      await refreshSummary();
    } catch (err) {
      console.error('Error loading demo day:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetDemoData = async () => {
    setLoading(true);
    try {
      await apiClient.resetDemo();
      setActiveDemoDay(1);
      setBannerAlert('Demo reset to initial clean state.');
      await refreshSummary();
    } catch (err) {
      console.error('Error resetting demo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        summary,
        loading,
        refreshSummary,
        loadDemoDay,
        resetDemoData,
        bannerAlert,
        setBannerAlert,
        activeDemoDay,
        setActiveDemoDay
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
