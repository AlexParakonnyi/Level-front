// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardPage } from "@/pages/DashboardPage";
import { SettingsPage } from "@/pages/SattingsPage";
import { SensorDetailsPage } from "@/pages/SensorDetailsPage";
import { Layout } from "@/components/Layout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ToastProvider } from "@/contexts/ToastContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

import "@/App.css";

function App() {
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Управление темой
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Показываем загрузочный экран
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 секунды загрузки

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ToastProvider>
      <SettingsProvider>
        <div className="min-w-[350px] overflow-x-auto">
          <BrowserRouter>
            <Layout isDark={isDark} onThemeToggle={() => setIsDark(!isDark)}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/sensor-details" element={<SensorDetailsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </div>
      </SettingsProvider>
    </ToastProvider>
  );
}

export default App;
