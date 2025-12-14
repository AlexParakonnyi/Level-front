// hooks/useConnection.ts
import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/backend";

export function useConnection() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Проверяем соединение при монтировании
    checkConnection();

    // Проверяем соединение каждые 5 секунд
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  async function checkConnection() {
    try {
      // Пытаемся сделать простой запрос к серверу
      await apiRequest("/settings");
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  }

  return { isConnected };
}
