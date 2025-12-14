// types/settings.ts

export interface Settings {
  roll_range: { min: number; max: number };
  pitch_range: { min: number; max: number };
  zero_offset: number;
  axis_swap: boolean;
  show_pitch: boolean;
}

export interface BatteryData {
  percentage: number;
  voltage: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
