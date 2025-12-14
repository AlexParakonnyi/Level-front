// pages/SensorDetailsPage.tsx
import { useMemo } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { calculateProcessedData } from "@/utils/sensorCalculations";
import { RawSensorData } from "@/components/RawSensorData";
import { SensorDataDisplay } from "@/components/SensorDataDisplay";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw, WifiOff, Activity, TrendingUp } from "lucide-react";

export function SensorDetailsPage() {
  const { sensorData, isConnected, error, messageRate, reconnect } =
    useWebSocket("ws", {
      reconnectDelay: 2000,
      maxReconnectAttempts: 10,
      // pingInterval: 30000,
    });

  // Вычисляем обработанные данные
  const processedData = useMemo(() => {
    return sensorData ? calculateProcessedData(sensorData) : null;
  }, [sensorData]);

  // Дополнительные полезные вычисления из сырых данных
  const additionalMetrics = useMemo(() => {
    if (!sensorData) return null;

    const { accelerometer, magnetometer } = sensorData;

    // Общее ускорение (magnitude)
    const totalAcceleration = Math.sqrt(
      accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2
    );

    // Магнитное поле (magnitude)
    const totalMagneticField = Math.sqrt(
      magnetometer.x ** 2 + magnetometer.y ** 2 + magnetometer.z ** 2
    );

    // Угол наклона относительно гравитации
    const tiltAngle =
      Math.acos(accelerometer.z / totalAcceleration) * (180 / Math.PI);

    // Определение ориентации
    const orientation =
      Math.abs(accelerometer.z) > 8
        ? "Flat"
        : Math.abs(accelerometer.x) > 8
        ? "Side"
        : Math.abs(accelerometer.y) > 8
        ? "Upright"
        : "Angled";

    return {
      totalAcceleration,
      totalMagneticField,
      tiltAngle,
      orientation,
    };
  }, [sensorData]);

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
  if (!sensorData || !processedData || !additionalMetrics) {
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
    <div className="space-y-6" data-testid="sensor-details-page">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Sensor Details
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Detailed sensor data and analysis
        </p>
      </div>

      {/* Performance Warning */}
      {messageRate > 0 && messageRate < 3 && (
        <Alert>
          <AlertDescription>
            Low message rate detected ({messageRate} msg/s). Expected ~5 msg/s.
            Check your WiFi connection.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Stats */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Connection Status
          </CardTitle>
          <CardDescription>Real-time connection metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Status
              </div>
              <div
                className={`font-bold ${
                  isConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Message Rate
              </div>
              <div className="font-bold text-blue-600 dark:text-blue-400">
                {messageRate} msg/s
              </div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Protocol
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                WebSocket
              </div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Latency
              </div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                Low
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processed Data Display */}
      <SensorDataDisplay data={processedData} />

      {/* Additional Metrics */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Calculated Metrics
          </CardTitle>
          <CardDescription>Derived values from raw sensor data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Total Acceleration
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {additionalMetrics.totalAcceleration.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                m/s²
              </div>
            </div>

            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Magnetic Field
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {additionalMetrics.totalMagneticField.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                µT
              </div>
            </div>

            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Tilt Angle
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {additionalMetrics.tiltAngle.toFixed(1)}°
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                from horizontal
              </div>
            </div>

            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Orientation
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {additionalMetrics.orientation}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                position
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Sensor Data */}
      <RawSensorData data={sensorData} />
    </div>
  );
}
