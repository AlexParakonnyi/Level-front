// components/SensorDataDisplay.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProcessedData } from "@/utils/sensorCalculations";
import { getCardinalDirection } from "@/utils/sensorCalculations";

interface SensorDataDisplayProps {
  data: ProcessedData;
}

export function SensorDataDisplay({ data }: SensorDataDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Roll Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
            Roll
          </CardTitle>
          <CardDescription>Left/right tilt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {data.roll.toFixed(1)}°
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              degrees
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pitch Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
            Pitch
          </CardTitle>
          <CardDescription>Forward/backward tilt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {data.pitch.toFixed(1)}°
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              degrees
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compass Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
            Compass
          </CardTitle>
          <CardDescription>Magnetic direction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Azimuth:
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xl">
              {data.heading.toFixed(0)}°
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Direction:
            </span>
            <Badge className="font-bold text-base">
              {getCardinalDirection(data.heading)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
