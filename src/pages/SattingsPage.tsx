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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wifi,
  Trash2,
  Loader2,
  RotateCw,
  Target,
  Sliders,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { apiRequest } from "@/utils/backend";
import { RangeSettings } from "@/components/RangeSettings";
import { useToast } from "@/contexts/ToastContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SettingsPage() {
  // WiFi Settings
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [ip, setIp] = useState("");
  const [gateway, setGateway] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();
  const {
    settings,
    updateSettings,
    isLoading: isLoadingSettings,
  } = useSettings();

  // Локальные настройки для редактирования
  const [localSettings, setLocalSettings] = useState(settings);

  // Синхронизация с глобальными настройками
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // ===== WiFi Functions =====

  const handleSaveWiFi = async () => {
    if (!ssid || !password || !ip || !gateway) {
      addToast("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest(
        `/set_wifi?ssid=${encodeURIComponent(ssid)}&pass=${encodeURIComponent(
          password
        )}&ip=${encodeURIComponent(ip)}&gateway=${encodeURIComponent(gateway)}`
      );

      addToast("WiFi configuration saved! Device is restarting...", "success");

      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      addToast("Error saving WiFi configuration", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCredentials = async () => {
    if (!confirm("Clear WiFi credentials? Device will restart in AP mode.")) {
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest("/clear_credentials");

      addToast("WiFi credentials cleared! Restarting in AP mode...", "success");

      setTimeout(() => {
        window.location.href = "http://192.168.4.1";
      }, 3000);
    } catch (error) {
      addToast("Error clearing credentials", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Level Settings Functions =====

  const handleCalibrateZero = async () => {
    setIsLoading(true);

    try {
      const result = await apiRequest<{ offset: number }>("/calibrate_zero");
      const newSettings = { ...localSettings, zero_offset: result.offset };
      setLocalSettings(newSettings);
      updateSettings(newSettings);
      addToast(
        `Zero calibrated! Offset: ${result.offset.toFixed(2)}°`,
        "success"
      );
    } catch (error) {
      addToast("Error calibrating zero", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOffset = async () => {
    setIsLoading(true);

    try {
      await apiRequest(`/set_zero_offset?offset=${localSettings.zero_offset}`);
      updateSettings({ zero_offset: localSettings.zero_offset });
      addToast("Zero offset saved!", "success");
    } catch (error) {
      addToast("Error saving offset", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAxisSwap = async () => {
    const newSwap = !localSettings.axis_swap;

    setIsLoading(true);

    try {
      await apiRequest(`/set_axis_swap?swap=${newSwap}`);
      const newSettings = { ...localSettings, axis_swap: newSwap };
      setLocalSettings(newSettings);
      updateSettings(newSettings);
      addToast(`Axis swap ${newSwap ? "enabled" : "disabled"}!`, "success");
    } catch (error) {
      addToast("Error toggling axis swap", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleShowPitch = async () => {
    const newShowPitch = !localSettings.show_pitch;

    // Сохраняем только локально, без отправки на сервер
    const newSettings = { ...localSettings, show_pitch: newShowPitch };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
    addToast(
      `Pitch display ${newShowPitch ? "enabled" : "disabled"}!`,
      "success"
    );
  };

  const handleSaveRanges = async () => {
    setIsLoading(true);

    try {
      await apiRequest(
        `/set_ranges?roll_min=${localSettings.roll_range.min}&roll_max=${localSettings.roll_range.max}&pitch_min=${localSettings.pitch_range.min}&pitch_max=${localSettings.pitch_range.max}`
      );
      updateSettings({
        roll_range: localSettings.roll_range,
        pitch_range: localSettings.pitch_range,
      });
      addToast("Ranges saved successfully!", "success");
    } catch (error) {
      addToast("Error saving ranges", "error");
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

      {/* Tabs */}
      <Tabs defaultValue="level" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="level">Level Settings</TabsTrigger>
          <TabsTrigger value="wifi">WiFi Settings</TabsTrigger>
        </TabsList>

        {/* Level Settings Tab */}
        <TabsContent value="level" className="space-y-6">
          {/* Show Pitch Toggle - НОВАЯ КАРТОЧКА */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {localSettings.show_pitch ? (
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
                Pitch Display
              </CardTitle>
              <CardDescription>
                Show or hide Pitch data in the 3D visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Pitch Data</Label>
                  <p className="text-sm text-slate-500">
                    {localSettings.show_pitch
                      ? "Pitch angle and range are visible"
                      : "Only Roll data is shown"}
                  </p>
                </div>
                <Switch
                  checked={localSettings.show_pitch}
                  onCheckedChange={handleToggleShowPitch}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Working Ranges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Working Ranges
              </CardTitle>
              <CardDescription>
                Define min and max angles for Roll and Pitch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RangeSettings
                settings={localSettings}
                onChange={setLocalSettings}
                onSave={handleSaveRanges}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

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
                    value={localSettings.zero_offset}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
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
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Save</span>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Current offset: {localSettings.zero_offset.toFixed(2)}°
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
                    {localSettings.axis_swap
                      ? "Roll and Pitch are swapped"
                      : "Normal mode"}
                  </p>
                </div>
                <Switch
                  checked={localSettings.axis_swap}
                  onCheckedChange={handleToggleAxisSwap}
                  disabled={isLoading}
                />
              </div>
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
                  <>Save Configuration</>
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
