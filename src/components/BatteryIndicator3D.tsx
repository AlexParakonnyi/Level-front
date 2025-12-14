// components/BatteryIndicator3D.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface BatteryIndicator3DProps {
  percentage: number; // 0-100
  voltage?: number;
}

export function BatteryIndicator3D({
  percentage,
  voltage,
}: BatteryIndicator3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    fillMesh: THREE.Mesh;
    bodyMesh: THREE.Mesh;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = 80;
    const height = 40;

    // Scene - убеждаемся, что фон прозрачный
    const scene = new THREE.Scene();
    scene.background = null; // Важно: null вместо цвета

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    // Renderer - настраиваем прозрачность и очистку
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // Включаем прозрачность
      preserveDrawingBuffer: false,
    });

    // Устанавливаем корректный clear цвет
    renderer.setClearColor(0x000000, 0); // Прозрачный черный

    renderer.setSize(width, height);

    // Важно: отключаем события мыши для canvas
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    // Battery body (корпус батареи)
    const bodyGeometry = new THREE.BoxGeometry(1.2, 0.6, 0.3);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.3,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    scene.add(bodyMesh);

    // Battery edges (контур)
    const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
    const bodyLines = new THREE.LineSegments(
      bodyEdges,
      new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 2 })
    );
    bodyMesh.add(bodyLines);

    // Battery terminal (плюсовой контакт)
    const terminalGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.2);
    const terminalMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.2,
    });
    const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
    terminal.position.set(0.675, 0, 0);
    scene.add(terminal);

    // Battery fill (заполнение - уровень заряда)
    const fillGeometry = new THREE.BoxGeometry(1.1, 0.5, 0.25);
    const fillMaterial = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x22c55e,
      emissiveIntensity: 0.3,
    });
    const fillMesh = new THREE.Mesh(fillGeometry, fillMaterial);
    fillMesh.position.set(0, 0, 0);
    scene.add(fillMesh);

    // Сохраняем ссылки
    sceneRef.current = { scene, camera, renderer, fillMesh, bodyMesh };

    // Animation loop
    let animationId: number;
    function animate() {
      animationId = requestAnimationFrame(animate);

      // Легкое покачивание
      const time = Date.now() * 0.001;
      bodyMesh.rotation.y = Math.sin(time * 0.5) * 0.1;
      bodyMesh.rotation.x = Math.sin(time * 0.3) * 0.05;

      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Обновление уровня заряда при изменении процента
  useEffect(() => {
    if (!sceneRef.current) return;

    const { fillMesh } = sceneRef.current;
    const material = fillMesh.material as THREE.MeshStandardMaterial;

    // Масштабируем заполнение по оси X в зависимости от процента
    const fillScale = Math.max(percentage / 100, 0.01); // Минимум 1% для видимости
    fillMesh.scale.x = fillScale;

    // Сдвигаем позицию, чтобы заполнение росло слева направо
    fillMesh.position.x = -0.55 * (1 - fillScale);

    // Меняем цвет в зависимости от уровня заряда
    if (percentage >= 60) {
      // Зеленый
      material.color.setHex(0x22c55e);
      material.emissive.setHex(0x22c55e);
      material.emissiveIntensity = 0.3;
    } else if (percentage >= 30) {
      // Желтый
      material.color.setHex(0xeab308);
      material.emissive.setHex(0xeab308);
      material.emissiveIntensity = 0.4;
    } else if (percentage >= 10) {
      // Оранжевый
      material.color.setHex(0xf97316);
      material.emissive.setHex(0xf97316);
      material.emissiveIntensity = 0.5;
    } else {
      // Красный
      material.color.setHex(0xef4444);
      material.emissive.setHex(0xef4444);
      material.emissiveIntensity = 0.6;
    }

    // Если заряд 0, делаем заполнение невидимым
    fillMesh.visible = percentage > 0;
  }, [percentage]);

  // Цвет текста в зависимости от заряда
  const getTextColor = () => {
    if (percentage >= 60) return "text-green-500";
    if (percentage >= 30) return "text-yellow-500";
    if (percentage >= 10) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{
          width: "80px",
          height: "40px",
          // Гарантируем, что контейнер не выходит за границы
          flexShrink: 0,
        }}
      />
      <div className="text-xs flex-shrink-0">
        <div className={`font-bold tabular-nums ${getTextColor()}`}>
          {percentage}%
        </div>
        {voltage !== undefined && voltage > 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {voltage.toFixed(2)}V
          </div>
        )}
      </div>
    </div>
  );
}
