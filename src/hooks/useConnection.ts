// hooks/useConnection.ts
import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/backend";

export function useConnection() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Проверяем соединение при монтировании
    checkConnection();

    // Проверяем соединение каждые 30 секунд
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  async function checkConnection() {
    try {
      await apiRequest("/battery");
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  }

  return { isConnected };
}
