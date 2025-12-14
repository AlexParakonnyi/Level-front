// components/RollChart.tsx - ОБНОВЛЕННЫЙ КОД
import { useEffect, useState, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RollChartProps {
  currentRoll: number;
}

interface RollDataPoint {
  timestamp: number;
  value: number;
}

const MAX_DATA_POINTS = 300;
const SAVE_INTERVAL = 100; // Уменьшаем интервал для более плавного обновления

export function RollChart({ currentRoll }: RollChartProps) {
  const [rollHistory, setRollHistory] = useState<RollDataPoint[]>([]);
  const chartRef = useRef<any>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dataBufferRef = useRef<RollDataPoint[]>([]);
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Оптимизированное добавление данных с буферизацией
  useEffect(() => {
    const now = Date.now();

    // Добавляем точку в буфер
    dataBufferRef.current.push({
      timestamp: now,
      value: currentRoll,
    });

    // Очищаем старый таймер если есть
    if (bufferTimerRef.current) {
      clearTimeout(bufferTimerRef.current);
    }

    // Обновляем данные с задержкой для оптимизации
    bufferTimerRef.current = setTimeout(() => {
      if (dataBufferRef.current.length > 0) {
        setRollHistory((prev) => {
          let newHistory = [...prev, ...dataBufferRef.current];
          if (newHistory.length > MAX_DATA_POINTS) {
            newHistory = newHistory.slice(newHistory.length - MAX_DATA_POINTS);
          }
          return newHistory;
        });
        dataBufferRef.current = [];
      }
    }, 50); // Небольшая задержка для батчинга

    return () => {
      if (bufferTimerRef.current) {
        clearTimeout(bufferTimerRef.current);
      }
    };
  }, [currentRoll]);

  // Оптимизированные опции графика
  const options = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,

      // 🔴 КРИТИЧЕСКО ВАЖНО: отключаем всю анимацию
      animation: {
        duration: 0, // НУЛЕВАЯ длительность анимации
        easing: "linear" as const,
      },
      transitions: {
        active: {
          animation: {
            duration: 0,
          },
        },
      },
      elements: {
        line: {
          tension: 0.4, // Сохраняем плавность линии
        },
        point: {
          radius: 0, // Без точек для производительности
          hoverRadius: 3,
        },
      },

      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleColor: "rgb(226, 232, 240)",
          bodyColor: "rgb(148, 163, 184)",
          borderColor: "rgb(71, 85, 105)",
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => `Roll: ${(context.parsed.y ?? 0).toFixed(1)}°`,
          },
        },
      },

      scales: {
        x: {
          display: true,
          grid: {
            display: false,
            drawOnChartArea: false,
            drawTicks: false,
          },
          ticks: {
            color: "rgb(148, 163, 184)",
            maxTicksLimit: 10,
            font: {
              size: 10,
            },
            callback: function (value, index) {
              if (rollHistory.length <= 1) return "";
              const secondsAgo =
                (rollHistory.length - 1 - index) * (SAVE_INTERVAL / 1000);
              if (secondsAgo < 1) return "Now";
              return `-${Math.floor(secondsAgo)}s`;
            },
          },
        },
        y: {
          display: true,
          grid: {
            color: "rgba(148, 163, 184, 0.1)",
            drawBorder: false,
          },
          ticks: {
            color: "rgb(148, 163, 184)",
            stepSize: 5,
            callback: (value) => `${Math.round(Number(value))}°`,
            font: {
              size: 11,
            },
          },
        },
      },

      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },

      // Оптимизация производительности
      devicePixelRatio: 2, // Для четкого отображения на retina
      hover: {
        mode: "nearest",
        intersect: false,
      },
      resizeDelay: 0,
    }),
    [rollHistory.length]
  );

  // Данные графика с оптимизацией
  const chartData = useMemo(
    () => ({
      labels: rollHistory.map((_, index) => index.toString()),
      datasets: [
        {
          label: "Roll (°)",
          data: rollHistory.map((point) => point.value),
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.05)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 10,
          cubicInterpolationMode: "monotone" as const,
        },
      ],
    }),
    [rollHistory]
  );

  // Обновляем график при изменении данных
  useEffect(() => {
    if (chartRef.current && rollHistory.length > 0) {
      const chart = chartRef.current;

      // Используем прямой метод обновления данных
      if (chart.chartInstance) {
        chart.chartInstance.data.datasets[0].data = rollHistory.map(
          (point) => point.value
        );
        chart.chartInstance.update("none"); // 'none' - без анимации
      }
    }
  }, [rollHistory]);

  // Обработчики drag-scroll (оставляем без изменений)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      startXRef.current = e.pageX - container.offsetLeft;
      scrollLeftRef.current = container.scrollLeft;
      container.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startXRef.current) * 2;
      container.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      container.style.cursor = "grab";
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
      container.style.cursor = "grab";
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Автоскролл к последним данным
  useEffect(() => {
    if (scrollContainerRef.current && rollHistory.length > 0) {
      const container = scrollContainerRef.current;
      if (!isDraggingRef.current) {
        requestAnimationFrame(() => {
          container.scrollLeft = container.scrollWidth;
        });
      }
    }
  }, [rollHistory.length]);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
              Roll History
            </CardTitle>
          </div>

          {/* ФИКСИРОВАННАЯ рамка с текущим значением */}
          <div className="relative">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center px-4 py-2 min-w-[230px] max-w-[230px]">
                <div className="flex items-baseline gap-2 w-full">
                  <span className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap flex-shrink-0">
                    Current Roll:
                  </span>
                  <div className="font-mono font-bold text-3xl text-emerald-600 dark:text-emerald-400 tabular-nums text-right flex-1 overflow-hidden">
                    <div className="w-[100px] text-right mx-auto">
                      {currentRoll.toFixed(1)}°
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Фиксируем ширину контента с помощью невидимого текста */}
            <div className="absolute top-0 left-0 opacity-0 pointer-events-none font-mono text-3xl">
              -123.4°
            </div>
          </div>
        </div>
        <CardDescription>
          {rollHistory.length} data points (
          {Math.floor(rollHistory.length * (SAVE_INTERVAL / 1000))}s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden"
          style={{
            maxWidth: "100%",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          <div
            style={{
              minWidth: `${Math.max(600, rollHistory.length * 2)}px`,
              height: "256px",
              position: "relative",
            }}
          >
            {rollHistory.length > 0 ? (
              <Line
                ref={chartRef}
                data={chartData}
                options={options}
                // 🔴 Важно: передаем key для принудительного обновления
                key={rollHistory.length}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                Collecting data...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
