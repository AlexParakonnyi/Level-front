// contexts/SettingsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiRequest } from "@/utils/backend";

interface Settings {
  roll_range: { min: number; max: number };
  pitch_range: { min: number; max: number };
  zero_offset: number;
  axis_swap: boolean;
  show_pitch: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  loadSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    roll_range: { min: -45, max: 45 },
    pitch_range: { min: -45, max: 45 },
    zero_offset: 0,
    axis_swap: false,
    show_pitch: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<Settings>("/settings");

      const storedShowPitch = localStorage.getItem("show_pitch");
      const showPitch =
        storedShowPitch !== null
          ? storedShowPitch === "true"
          : data.show_pitch ?? true;

      setSettings({
        roll_range: {
          min: data.roll_range?.min ?? -5,
          max: data.roll_range?.max ?? 5,
        },
        pitch_range: {
          min: data.pitch_range?.min ?? -5,
          max: data.pitch_range?.max ?? 5,
        },
        zero_offset: data.zero_offset ?? 0,
        axis_swap: data.axis_swap ?? false,
        show_pitch: showPitch,
      });
      console.log("Settings loaded:", data);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };

      if (newSettings.show_pitch !== undefined) {
        localStorage.setItem("show_pitch", String(newSettings.show_pitch));
      }

      return updated;
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, loadSettings, isLoading }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
