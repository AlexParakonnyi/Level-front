// pages/DashboardPage.tsx
import { useMemo, useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { calculateProcessedData } from "@/utils/sensorCalculations";
import { LevelBox3D } from "@/components/LevelBox3D";
import { RollChart } from "@/components/RollChart";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/Modal";
import { RangeSettings } from "@/components/RangeSettings";
import { useToast } from "@/contexts/ToastContext";
import { useSettings } from "@/contexts/SettingsContext";
import { apiRequest } from "@/utils/backend";
import { Sliders } from "lucide-react";

export function DashboardPage() {
  const { sensorData, isConnected, error, messageRate } = useWebSocket("ws", {
    reconnectDelay: 2000,
    maxReconnectAttempts: 10,
  });

  const { addToast } = useToast();
  const { settings, updateSettings } = useSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasShownLowRateWarning, setHasShownLowRateWarning] = useState(false);

  // Синхронизируем локальные настройки с глобальными
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Вычисляем обработанные данные
  const processedData = useMemo(() => {
    return sensorData ? calculateProcessedData(sensorData) : null;
  }, [sensorData]);

  // Сохранение диапазонов
  const handleSaveRanges = async () => {
    setIsSaving(true);
    try {
      await apiRequest(
        `/set_ranges?roll_min=${localSettings.roll_range.min}&roll_max=${localSettings.roll_range.max}&pitch_min=${localSettings.pitch_range.min}&pitch_max=${localSettings.pitch_range.max}`
      );

      // Обновляем глобальные настройки
      updateSettings(localSettings);

      addToast("Ranges saved successfully!", "success");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save ranges:", error);
      addToast("Error saving ranges", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Показываем ошибку через toast
  useEffect(() => {
    if (error) {
      addToast(error, "error");
    }
  }, [error, addToast]);

  // Показываем предупреждение о низкой скорости только один раз
  useEffect(() => {
    if (messageRate > 0 && messageRate < 3 && !hasShownLowRateWarning) {
      addToast(
        `Low message rate detected (${messageRate} msg/s). Expected ~5 msg/s. Check your WiFi connection.`,
        "error"
      );
      setHasShownLowRateWarning(true);
    }
    // Сбрасываем флаг, если скорость нормализовалась
    if (messageRate >= 3 && hasShownLowRateWarning) {
      setHasShownLowRateWarning(false);
    }
  }, [messageRate, hasShownLowRateWarning, addToast]);

  // Показываем загрузку
  if (!sensorData || !processedData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
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
    <>
      <div className="space-y-6" data-testid="sensor-dashboard">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Dashboard
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Real-time orientation monitoring
            </p>
          </div>

          {/* Range Settings Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Sliders className="w-4 h-4 mr-2" />
            Range settings
          </Button>
        </div>

        {/* 3D Visualization */}
        <div className="w-full">
          <LevelBox3D
            roll={processedData.roll}
            pitch={processedData.pitch}
            rollRangeMin={settings.roll_range.min}
            rollRangeMax={settings.roll_range.max}
            pitchRangeMin={settings.pitch_range.min}
            pitchRangeMax={settings.pitch_range.max}
            showPitch={settings.show_pitch}
          />
        </div>

        {/* Roll Chart - Адаптивная раскладка */}
        <div className="w-full">
          <RollChart currentRoll={processedData.roll} />
        </div>
      </div>

      {/* Modal for Range Settings */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setLocalSettings(settings);
        }}
        title="Adjust Working Ranges"
      >
        <RangeSettings
          settings={localSettings}
          onChange={setLocalSettings}
          onSave={handleSaveRanges}
          isLoading={isSaving}
        />
      </Modal>
    </>
  );
}
