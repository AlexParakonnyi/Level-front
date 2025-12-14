// pages/DashboardPage.tsx
import { useMemo, useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { calculateProcessedData } from "@/utils/sensorCalculations";
import { LevelBox3D } from "@/components/LevelBox3D";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff } from "lucide-react";
import { apiRequest } from "@/utils/backend";

interface Settings {
  level_range: { min: number; max: number };
  zero_offset: number;
  axis_swap: boolean;
}

export function DashboardPage() {
  const { sensorData, isConnected, error, messageRate, reconnect } =
    useWebSocket("ws", {
      reconnectDelay: 2000,
      maxReconnectAttempts: 10,
      // pingInterval: 30000,
    });

  const [settings, setSettings] = useState<Settings>({
    level_range: { min: -45, max: 45 },
    zero_offset: 0,
    axis_swap: false,
  });

  // Вычисляем обработанные данные
  const processedData = useMemo(() => {
    return sensorData ? calculateProcessedData(sensorData) : null;
  }, [sensorData]);

  // Загружаем настройки при монтировании
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiRequest<Settings>("/settings");
        setSettings({
          level_range: {
            min: data.level_range?.min ?? -45,
            max: data.level_range?.max ?? 45,
          },
          zero_offset: data.zero_offset ?? 0,
          axis_swap: data.axis_swap ?? false,
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Показываем ошибку
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button onClick={reconnect} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Показываем загрузку
  if (!sensorData || !processedData) {
    return (
      <div className="space-y-6">
        <div
          className="flex items-center justify-center h-96"
          data-testid="loading-state"
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Waiting for sensor data...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              {isConnected
                ? "Connected, waiting for data..."
                : "Connecting to device..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="sensor-dashboard">
      {/* Performance Warning */}
      {messageRate > 0 && messageRate < 3 && (
        <Alert>
          <AlertDescription>
            Low message rate detected ({messageRate} msg/s). Expected ~5 msg/s.
            Check your WiFi connection.
          </AlertDescription>
        </Alert>
      )}

      {/* 3D Visualization with Range */}
      <div className="w-full">
        <LevelBox3D
          roll={processedData.roll}
          pitch={processedData.pitch}
          rangeMin={settings.level_range.min}
          rangeMax={settings.level_range.max}
        />
      </div>
    </div>
  );
}
