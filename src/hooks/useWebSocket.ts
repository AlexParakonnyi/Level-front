// hooks/useWebSocket.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useState, useEffect, useRef, useCallback } from "react";
import { SensorData } from "@/utils/sensorCalculations";

interface WebSocketConfig {
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

function getWebSocketHost(): string {
  const debugIp = process.env.REACT_APP_DEBUG_IP;
  if (debugIp && debugIp.trim() !== "") {
    console.log("Using DEBUG IP for WebSocket:", debugIp);
    return debugIp.trim();
  }
  console.log("Using current host for WebSocket:", window.location.hostname);
  return window.location.hostname;
}

export function useWebSocket(endpoint: string, config: WebSocketConfig = {}) {
  const { reconnectDelay = 2000, maxReconnectAttempts = 10 } = config;

  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageRate, setMessageRate] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const messageCountRef = useRef(0);
  const lastRateUpdateRef = useRef(Date.now());
  const isMountedRef = useRef(true); // ДОБАВЛЕНО: отслеживание монтирования
  const isConnectingRef = useRef(false); // ДОБАВЛЕНО: предотвращение множественных подключений

  // Очистка ресурсов
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;

      // Удаляем обработчики
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;

      // Закрываем только если соединение открыто
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    }

    isConnectingRef.current = false;
  }, []);

  // Подключение к WebSocket
  const connectWebSocket = useCallback(() => {
    // ИСПРАВЛЕНИЕ: Проверяем, что компонент примонтирован и нет активного подключения
    if (!isMountedRef.current || isConnectingRef.current) {
      return;
    }

    // Очищаем предыдущее соединение
    cleanup();

    isConnectingRef.current = true;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = getWebSocketHost();
      const wsUrl = `${protocol}//${host}:81`;

      console.log("Connecting to WebSocket:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) {
          ws.close();
          return;
        }

        console.log("✓ WebSocket connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;

        try {
          let jsonString = event.data;

          // Очистка данных от NaN и Infinity
          jsonString = jsonString
            .replace(/:\s*nan\b/gi, ": null")
            .replace(/:\s*-nan\b/gi, ": null")
            .replace(/:\s*inf\b/gi, ": null")
            .replace(/:\s*-inf\b/gi, ": null")
            .replace(/:\s*infinity\b/gi, ": null")
            .replace(/:\s*-infinity\b/gi, ": null");

          const data = JSON.parse(jsonString) as SensorData;

          if (data.roll !== undefined && data.pitch !== undefined) {
            const cleanData: SensorData = {
              roll: data.roll ?? 0,
              pitch: data.pitch ?? 0,
              accelerometer: {
                x: data.accelerometer?.x ?? 0,
                y: data.accelerometer?.y ?? 0,
                z: data.accelerometer?.z ?? 0,
              },
              magnetometer: {
                x: data.magnetometer?.x ?? 0,
                y: data.magnetometer?.y ?? 0,
                z: data.magnetometer?.z ?? 0,
              },
              timestamp: data.timestamp ?? Date.now(),
            };

            setSensorData(cleanData);
            setError(null);

            // Подсчёт частоты сообщений
            messageCountRef.current++;
            const now = Date.now();
            if (now - lastRateUpdateRef.current >= 1000) {
              setMessageRate(messageCountRef.current);
              messageCountRef.current = 0;
              lastRateUpdateRef.current = now;
            }
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = (event) => {
        if (!isMountedRef.current) return;
        console.error("WebSocket error:", event);
        setError("Connection error");
        isConnectingRef.current = false;
      };

      ws.onclose = (event) => {
        if (!isMountedRef.current) return;

        console.log(`WebSocket closed (code: ${event.code})`);
        setIsConnected(false);
        wsRef.current = null;
        isConnectingRef.current = false;

        // ИСПРАВЛЕНИЕ: Переподключаемся только если компонент еще примонтирован
        if (
          isMountedRef.current &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          const delay = Math.min(
            reconnectDelay * Math.pow(1.5, reconnectAttemptsRef.current),
            30000
          );

          console.log(
            `Reconnecting in ${delay}ms (attempt ${
              reconnectAttemptsRef.current + 1
            }/${maxReconnectAttempts})...`
          );

          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (isMountedRef.current) {
              reconnectAttemptsRef.current++;
              connectWebSocket();
            }
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError("Connection lost. Maximum reconnection attempts reached.");
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setError("Failed to establish connection");
      isConnectingRef.current = false;
    }
  }, [cleanup, reconnectDelay, maxReconnectAttempts]);

  // Подключаемся при монтировании
  useEffect(() => {
    isMountedRef.current = true;
    connectWebSocket();

    // ИСПРАВЛЕНИЕ: Важная очистка при размонтировании
    return () => {
      console.log("WebSocket hook unmounting - cleaning up");
      isMountedRef.current = false;
      cleanup();
    };
  }, [connectWebSocket, cleanup]);

  // Ручное переподключение
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connectWebSocket();
  }, [connectWebSocket]);

  return {
    sensorData,
    isConnected,
    error,
    messageRate,
    reconnect,
  };
}
