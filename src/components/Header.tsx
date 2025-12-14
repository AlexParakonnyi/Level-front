// components/Header.tsx
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Navigation, Settings, Database } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BatteryIndicator3D } from "@/components/BatteryIndicator3D";
import { apiRequest } from "@/utils/backend";

interface HeaderProps {
  isOnline: boolean;
  isDark: boolean;
  onThemeToggle: () => void;
}

interface BatteryData {
  percentage: number;
  voltage: number;
}

export function Header({ isOnline, isDark, onThemeToggle }: HeaderProps) {
  const location = useLocation();
  const [battery, setBattery] = useState<BatteryData>({
    percentage: 0,
    voltage: 0,
  });

  // Загрузка данных батареи
  useEffect(() => {
    async function fetchBattery() {
      try {
        const data = await apiRequest<BatteryData>("/battery");
        setBattery(data);
      } catch (error) {
        console.error("Failed to fetch battery data:", error);
        // При ошибке оставляем 0
        setBattery({ percentage: 0, voltage: 0 });
      }
    }

    // Загружаем сразу
    fetchBattery();

    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchBattery, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Основная строка - всегда видна */}
        <div className="flex items-center justify-between mb-2 sm:mb-0">
          {/* Logo and Title */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                Level GUN
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Real-time 3D visualization
              </p>
            </div>
          </Link>

          {/* Правая часть - статус и кнопки (БЕЗ батареи) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Badge */}
            <Badge
              variant={isOnline ? "default" : "destructive"}
              className="px-2 py-0.5 sm:px-3 sm:py-1"
              data-testid="connection-status-badge"
            >
              <div
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 ${
                  isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
              />
              <span className="text-xs sm:text-sm">
                {isOnline ? "Online" : "Offline"}
              </span>
            </Badge>

            {/* Sensor Details Button */}
            <Link to="/sensor-details">
              <Button
                variant={
                  location.pathname === "/sensor-details"
                    ? "default"
                    : "outline"
                }
                size="icon"
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
                data-testid="sensor-details-button"
              >
                <Database className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>

            {/* Settings Button */}
            <Link to="/settings">
              <Button
                variant={
                  location.pathname === "/settings" ? "default" : "outline"
                }
                size="icon"
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
                data-testid="settings-button"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={onThemeToggle}
              className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
              data-testid="theme-toggle-button"
            >
              {isDark ? (
                <Sun className="h-4 w-4 sm:h-5 w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 w-5" />
              )}
            </Button>

            {/* Battery Indicator ТОЛЬКО для десктопа */}
            <div className="hidden sm:block ml-1">
              <BatteryIndicator3D
                percentage={battery.percentage}
                voltage={battery.voltage}
              />
            </div>
          </div>
        </div>

        {/* Вторая строка ТОЛЬКО для мобильных - только Battery Indicator */}
        <div className="sm:hidden flex justify-end items-center -mt-1">
          <div className="scale-90 origin-right">
            <BatteryIndicator3D
              percentage={battery.percentage}
              voltage={battery.voltage}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
