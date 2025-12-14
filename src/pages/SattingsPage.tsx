// pages/SettingsPage.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wifi,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  RotateCw,
  Target,
  Sliders,
} from "lucide-react";
import { apiRequest } from "@/utils/backend";

interface Settings {
  level_range: { min: number; max: number };
  zero_offset: number;
  axis_swap: boolean;
}

export function SettingsPage() {
  // WiFi Settings
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [ip, setIp] = useState("");
  const [gateway, setGateway] = useState("");

  // Level Settings
  const [settings, setSettings] = useState<Settings>({
    level_range: { min: -45, max: 45 },
    zero_offset: 0,
    axis_swap: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Загрузка настроек при монтировании
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const data = await apiRequest<Settings>("/settings");

      // Обновляем состояние полученными данными
      setSettings({
        level_range: {
          min: data.level_range?.min ?? -45,
          max: data.level_range?.max ?? 45,
        },
        zero_offset: data.zero_offset ?? 0,
        axis_swap: data.axis_swap ?? false,
      });

      console.log("Settings loaded:", data);
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage({
        type: "error",
        text: "Failed to load settings from device",
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // ===== WiFi Functions =====

  const handleSaveWiFi = async () => {
    if (!ssid || !password || !ip || !gateway) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await apiRequest(
        `/set_wifi?ssid=${encodeURIComponent(ssid)}&pass=${encodeURIComponent(
          password
        )}&ip=${encodeURIComponent(ip)}&gateway=${encodeURIComponent(gateway)}`
      );

      setMessage({
        type: "success",
        text: "WiFi configuration saved! Device is restarting...",
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error saving WiFi configuration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCredentials = async () => {
    if (!confirm("Clear WiFi credentials? Device will restart in AP mode.")) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await apiRequest("/clear_credentials");

      setMessage({
        type: "success",
        text: "WiFi credentials cleared! Restarting in AP mode...",
      });

      setTimeout(() => {
        window.location.href = "http://192.168.4.1";
      }, 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error clearing credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Level Settings Functions =====

  const handleCalibrateZero = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await apiRequest<{ offset: number }>("/calibrate_zero");
      setSettings((prev) => ({ ...prev, zero_offset: result.offset }));
      setMessage({
        type: "success",
        text: `Zero calibrated! Offset: ${result.offset.toFixed(2)}°`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error calibrating zero.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOffset = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await apiRequest(`/set_zero_offset?offset=${settings.zero_offset}`);
      setMessage({
        type: "success",
        text: "Zero offset saved!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error saving offset.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAxisSwap = async () => {
    const newSwap = !settings.axis_swap;

    setIsLoading(true);
    setMessage(null);

    try {
      await apiRequest(`/set_axis_swap?swap=${newSwap}`);
      setSettings((prev) => ({ ...prev, axis_swap: newSwap }));
      setMessage({
        type: "success",
        text: `Axis swap ${newSwap ? "enabled" : "disabled"}!`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error toggling axis swap.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRange = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await apiRequest(
        `/set_level_range?min=${settings.level_range.min}&max=${settings.level_range.max}`
      );
      setMessage({
        type: "success",
        text: "Level range saved!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error saving level range.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Показываем загрузку при первоначальной загрузке настроек
  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1
          className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Configure your Level GUN device
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={
            message.type === "success"
              ? "border-green-500 text-green-900 dark:text-green-100 bg-green-50 dark:bg-green-900/20"
              : ""
          }
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="level" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="level">Level Settings</TabsTrigger>
          <TabsTrigger value="wifi">WiFi Settings</TabsTrigger>
        </TabsList>

        {/* Level Settings Tab */}
        <TabsContent value="level" className="space-y-6">
          {/* Zero Offset */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Zero Calibration
              </CardTitle>
              <CardDescription>
                Set the current position as 0° or adjust offset manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleCalibrateZero}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Target className="mr-2 h-4 w-4" />
                  )}
                  Auto Calibrate Zero
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offset">Manual Offset (degrees)</Label>
                <div className="flex gap-2">
                  <Input
                    id="offset"
                    type="number"
                    step="0.1"
                    value={settings.zero_offset}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        zero_offset: parseFloat(e.target.value) || 0,
                      }))
                    }
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSaveOffset}
                    disabled={isLoading}
                    variant="outline"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Current offset: {settings.zero_offset.toFixed(2)}°
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Axis Swap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Axis Swap
              </CardTitle>
              <CardDescription>Swap Roll and Pitch axes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Swap Roll ↔ Pitch</Label>
                  <p className="text-sm text-slate-500">
                    {settings.axis_swap
                      ? "Roll and Pitch are swapped"
                      : "Normal mode"}
                  </p>
                </div>
                <Switch
                  checked={settings.axis_swap}
                  onCheckedChange={handleToggleAxisSwap}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Level Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Working Range
              </CardTitle>
              <CardDescription>
                Define min and max angles for the working range
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Min Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Minimum Angle</Label>
                  <span className="text-sm font-mono font-bold">
                    {settings.level_range.min}°
                  </span>
                </div>
                <Slider
                  value={[settings.level_range.min]}
                  onValueChange={([value]: number[]) =>
                    setSettings((prev) => ({
                      ...prev,
                      level_range: { ...prev.level_range, min: value },
                    }))
                  }
                  min={-90}
                  max={0}
                  step={1}
                  disabled={isLoading}
                />
                <Input
                  type="number"
                  value={settings.level_range.min}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      level_range: {
                        ...prev.level_range,
                        min: parseInt(e.target.value) || -45,
                      },
                    }))
                  }
                  disabled={isLoading}
                  className="w-24"
                />
              </div>

              {/* Max Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Maximum Angle</Label>
                  <span className="text-sm font-mono font-bold">
                    {settings.level_range.max}°
                  </span>
                </div>
                <Slider
                  value={[settings.level_range.max]}
                  onValueChange={([value]: number[]) =>
                    setSettings((prev) => ({
                      ...prev,
                      level_range: { ...prev.level_range, max: value },
                    }))
                  }
                  min={0}
                  max={90}
                  step={1}
                  disabled={isLoading}
                />
                <Input
                  type="number"
                  value={settings.level_range.max}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      level_range: {
                        ...prev.level_range,
                        max: parseInt(e.target.value) || 45,
                      },
                    }))
                  }
                  disabled={isLoading}
                  className="w-24"
                />
              </div>

              {/* Range Preview */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-center">
                  Working range:{" "}
                  <span className="font-bold">
                    {settings.level_range.min}° to {settings.level_range.max}°
                  </span>
                </p>
              </div>

              <Button
                onClick={handleSaveRange}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Range
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WiFi Settings Tab */}
        <TabsContent value="wifi" className="space-y-6">
          {/* WiFi Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                WiFi Configuration
              </CardTitle>
              <CardDescription>
                Connect your device to a WiFi network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ssid">Network Name (SSID)</Label>
                <Input
                  id="ssid"
                  type="text"
                  placeholder="Enter network name"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  type="text"
                  placeholder="192.168.1.100"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gateway">Gateway</Label>
                <Input
                  id="gateway"
                  type="text"
                  placeholder="192.168.1.1"
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleSaveWiFi}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Clear Credentials */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
                Clear WiFi Credentials
              </CardTitle>
              <CardDescription>
                Remove saved WiFi settings and restart in AP mode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will clear all WiFi settings and restart the device in
                  Access Point mode (192.168.4.1)
                </AlertDescription>
              </Alert>

              <Button
                variant="destructive"
                onClick={handleClearCredentials}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Credentials
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
