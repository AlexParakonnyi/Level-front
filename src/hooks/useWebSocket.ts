// hooks/useWebSocket.ts - ДЛЯ WEBSOCKETS НА ПОРТУ 81
import { useState, useEffect, useRef, useCallback } from "react";
import { SensorData } from "@/utils/sensorCalculations";

interface WebSocketConfig {
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

/**
 * Получает хост для WebSocket соединения
 * Если определена REACT_APP_DEBUG_IP - использует её
 * Иначе использует текущий host страницы
 */
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
  const [messageRate, setMessageRate] = useState(0); // Сообщений в секунду

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const messageCountRef = useRef(0);
  const lastRateUpdateRef = useRef(Date.now());

  // Очистка ресурсов
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      // Удаляем обработчики перед закрытием
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;

      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  // Подключение к WebSocket
  const connectWebSocket = useCallback(() => {
    // Очищаем предыдущее соединение
    cleanup();

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = getWebSocketHost();

      // WebSocket на порту 81 (без endpoint - прямое подключение)
      const wsUrl = `${protocol}//${host}:81`;

      console.log("Connecting to WebSocket:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Обработчик открытия соединения
      ws.onopen = () => {
        console.log("✓ WebSocket connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      // Обработчик сообщений
      ws.onmessage = (event) => {
        try {
          // Заменяем nan и inf на null перед парсингом JSON
          let jsonString = event.data;

          // Заменяем все варианты NaN и Infinity
          jsonString = jsonString
            .replace(/:\s*nan\b/gi, ": null")
            .replace(/:\s*-nan\b/gi, ": null")
            .replace(/:\s*inf\b/gi, ": null")
            .replace(/:\s*-inf\b/gi, ": null")
            .replace(/:\s*infinity\b/gi, ": null")
            .replace(/:\s*-infinity\b/gi, ": null");

          const data = JSON.parse(jsonString) as SensorData;

          // Проверяем валидность данных и заменяем null на 0
          if (data.roll !== undefined && data.pitch !== undefined) {
            // Очищаем данные от null значений
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
          console.error(
            "Failed to parse WebSocket message:",
            err,
            "Raw data:",
            event.data
          );
          // Не устанавливаем ошибку, чтобы не прерывать поток данных
          // setError("Invalid data format");
        }
      };

      // Обработчик ошибок
      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Connection error");
      };

      // Обработчик закрытия
      ws.onclose = (event) => {
        console.log(
          `WebSocket closed (code: ${event.code}, reason: ${event.reason})`
        );
        setIsConnected(false);
        wsRef.current = null;

        // Попытка переподключения
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
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
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        } else {
          setError(
            "Connection lost. Maximum reconnection attempts reached. Please refresh the page."
          );
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setError("Failed to establish connection");
    }
  }, [cleanup, reconnectDelay, maxReconnectAttempts]);

  // Подключаемся при монтировании
  useEffect(() => {
    connectWebSocket();

    return () => {
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
