// components/RangeSettings.tsx
import { Save, Loader2 } from "lucide-react";
import type { Settings } from "@/types/settings";

// interface Settings {
//   roll_range: { min: number; max: number };
//   pitch_range: { min: number; max: number };
//   zero_offset: number;
//   axis_swap: boolean;
// }

interface RangeSettingsProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onSave: () => void;
  isLoading: boolean;
}

export function RangeSettings({
  settings,
  onChange,
  onSave,
  isLoading,
}: RangeSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Roll Range */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          Roll Range
        </h3>

        {/* Roll Min */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Minimum Angle
            </label>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
              {settings.roll_range.min}°
            </span>
          </div>
          <input
            type="range"
            min={-90}
            max={0}
            value={settings.roll_range.min}
            onChange={(e) =>
              onChange({
                ...settings,
                roll_range: {
                  ...settings.roll_range,
                  min: parseInt(e.target.value),
                },
              })
            }
            disabled={isLoading}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-emerald"
          />
          <input
            type="number"
            value={settings.roll_range.min}
            onChange={(e) =>
              onChange({
                ...settings,
                roll_range: {
                  ...settings.roll_range,
                  min: parseInt(e.target.value) || -45,
                },
              })
            }
            disabled={isLoading}
            className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Roll Max */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Maximum Angle
            </label>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
              {settings.roll_range.max}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            value={settings.roll_range.max}
            onChange={(e) =>
              onChange({
                ...settings,
                roll_range: {
                  ...settings.roll_range,
                  max: parseInt(e.target.value),
                },
              })
            }
            disabled={isLoading}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-emerald"
          />
          <input
            type="number"
            value={settings.roll_range.max}
            onChange={(e) =>
              onChange({
                ...settings,
                roll_range: {
                  ...settings.roll_range,
                  max: parseInt(e.target.value) || 45,
                },
              })
            }
            disabled={isLoading}
            className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-700" />

      {/* Pitch Range */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          Pitch Range
        </h3>

        {/* Pitch Min */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Minimum Angle
            </label>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
              {settings.pitch_range.min}°
            </span>
          </div>
          <input
            type="range"
            min={-90}
            max={0}
            value={settings.pitch_range.min}
            onChange={(e) =>
              onChange({
                ...settings,
                pitch_range: {
                  ...settings.pitch_range,
                  min: parseInt(e.target.value),
                },
              })
            }
            disabled={isLoading}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
          />
          <input
            type="number"
            value={settings.pitch_range.min}
            onChange={(e) =>
              onChange({
                ...settings,
                pitch_range: {
                  ...settings.pitch_range,
                  min: parseInt(e.target.value) || -45,
                },
              })
            }
            disabled={isLoading}
            className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Pitch Max */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Maximum Angle
            </label>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
              {settings.pitch_range.max}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            value={settings.pitch_range.max}
            onChange={(e) =>
              onChange({
                ...settings,
                pitch_range: {
                  ...settings.pitch_range,
                  max: parseInt(e.target.value),
                },
              })
            }
            disabled={isLoading}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
          />
          <input
            type="number"
            value={settings.pitch_range.max}
            onChange={(e) =>
              onChange({
                ...settings,
                pitch_range: {
                  ...settings.pitch_range,
                  max: parseInt(e.target.value) || 45,
                },
              })
            }
            disabled={isLoading}
            className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-2">
        <p className="text-sm text-center">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Roll:
          </span>{" "}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {settings.roll_range.min}° to {settings.roll_range.max}°
          </span>
        </p>
        <p className="text-sm text-center">
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Pitch:
          </span>{" "}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {settings.pitch_range.min}° to {settings.pitch_range.max}°
          </span>
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Ranges
          </>
        )}
      </button>

      <style>{`
        /* Range slider styles */
        input[type="range"] {
          -webkit-appearance: none;
        }

        input[type="range"]:focus {
          outline: none;
        }

        /* Emerald slider */
        .slider-emerald::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-emerald::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* Blue slider */
        .slider-blue::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-blue::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
