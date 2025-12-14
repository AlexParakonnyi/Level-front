// utils/backend.ts

/**
 * Получает хост для API запросов
 * Если определена REACT_APP_DEBUG_IP - использует её
 * Иначе использует текущий host страницы
 */
function getApiHost(): string {
  const debugIp = process.env.REACT_APP_DEBUG_IP;

  if (debugIp && debugIp.trim() !== "") {
    console.log("Using DEBUG IP:", debugIp);
    return debugIp.trim();
  }

  console.log("Using current host:", window.location.host);
  return window.location.host;
}

/**
 * Выполняет HTTP запрос к API
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const host = getApiHost();

    // Формируем абсолютный URL
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;

    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const url = `${protocol}//${host}/${cleanEndpoint}`;

    console.log("API Request URL:", url);

    const response = await fetch(url, {
      ...options,
      mode: "cors", // Явно указываем режим CORS
      credentials: "omit", // Не отправляем куки
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Если ответ пустой (статус 204)
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data as T;
    }

    // Если не JSON, возвращаем пустой объект
    return {} as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
