// components/NavigationData.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "lucide-react";
import { ProcessedData } from "@/utils/sensorCalculations";
import { getCardinalDirection } from "@/utils/sensorCalculations";

interface NavigationDataProps {
  data: ProcessedData;
}

export function NavigationData({ data }: NavigationDataProps) {
  return (
    <div>
      <h2
        className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        <Navigation className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        Navigation Data
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pitch Card */}
        <Card
          className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          data-testid="pitch-card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
              Pitch
            </CardTitle>
            <CardDescription>Forward/backward tilt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div
                className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2"
                data-testid="pitch-value"
              >
                {data.pitch}°
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                degrees
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roll Card */}
        <Card
          className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          data-testid="roll-card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
              Roll
            </CardTitle>
            <CardDescription>Left/right tilt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div
                className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2"
                data-testid="roll-value"
              >
                {data.roll}°
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                degrees
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compass Card */}
        <Card
          className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          data-testid="compass-card"
        >
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
              <span
                className="font-mono font-bold text-slate-900 dark:text-slate-100"
                data-testid="heading-value"
              >
                {data.heading}°
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Direction:
              </span>
              <Badge className="font-bold" data-testid="cardinal-direction">
                {getCardinalDirection(data.heading)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
