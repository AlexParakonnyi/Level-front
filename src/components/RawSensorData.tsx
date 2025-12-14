// components/RawSensorData.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gauge, TrendingUp, Compass } from "lucide-react";
import { SensorData } from "@/utils/sensorCalculations";

interface RawSensorDataProps {
  data: SensorData;
}

export function RawSensorData({ data }: RawSensorDataProps) {
  return (
    <div>
      <h2
        className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        <Gauge className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        Raw Sensor Data
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accelerometer Card */}
        <Card
          className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow"
          data-testid="accelerometer-card"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Accelerometer
            </CardTitle>
            <CardDescription>Linear acceleration (m/s²)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["x", "y", "z"].map((axis) => (
                <div
                  key={axis}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {axis.toUpperCase()}:
                  </span>
                  <span
                    className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100"
                    data-testid={`accelerometer-${axis}`}
                  >
                    {data.accelerometer[
                      axis as keyof typeof data.accelerometer
                    ].toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Magnetometer Card */}
        <Card
          className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow"
          data-testid="magnetometer-card"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Magnetometer
            </CardTitle>
            <CardDescription>Magnetic field (µT)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["x", "y", "z"].map((axis) => (
                <div
                  key={axis}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {axis.toUpperCase()}:
                  </span>
                  <span
                    className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100"
                    data-testid={`magnetometer-${axis}`}
                  >
                    {data.magnetometer[
                      axis as keyof typeof data.magnetometer
                    ].toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
