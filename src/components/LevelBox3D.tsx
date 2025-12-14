// components/LevelBox3D.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";

interface LevelBox3DProps {
  roll: number;
  pitch: number;
  rangeMin?: number;
  rangeMax?: number;
}

export function LevelBox3D({
  roll,
  pitch,
  rangeMin = -45,
  rangeMax = 45,
}: LevelBox3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    box: THREE.Mesh;
    gridHelper: THREE.GridHelper;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // camera.position.set(0, 5, 10);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0.5, -0.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Grid Helper (пол)
    const gridHelper = new THREE.GridHelper(10, 10, 0x4b5563, 0x374151);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Box (параллелепипед)
    const geometry = new THREE.BoxGeometry(3, 1, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x22c55e, // Светло-зеленый по умолчанию
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.95,
    });

    const box = new THREE.Mesh(geometry, material);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    // Edges (контуры)
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    box.add(wireframe);

    // Reference plane (опорная плоскость под коробкой)
    const planeGeometry = new THREE.PlaneGeometry(8, 8);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Сохраняем ссылки
    sceneRef.current = { scene, camera, renderer, box, gridHelper };

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Обработка resize
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      sceneRef.current.camera.aspect = newWidth / height;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(newWidth, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Обновление ротации и цвета при изменении roll/pitch
  useEffect(() => {
    if (!sceneRef.current) return;

    const { box } = sceneRef.current;

    // Конвертируем градусы в радианы
    const rollRad = (roll * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    // Применяем ротацию
    box.rotation.z = rollRad;
    box.rotation.x = pitchRad;

    // Определяем цвет на основе roll и диапазона
    const material = box.material as THREE.MeshStandardMaterial;

    if (roll < rangeMin) {
      // Красный цвет: чем меньше значение, тем краснее
      const intensity = Math.min(Math.abs(roll - rangeMin) / 45, 1);
      const red = Math.floor(255);
      const green = Math.floor(100 * (1 - intensity));
      const blue = Math.floor(100 * (1 - intensity));
      material.color.setRGB(red / 255, green / 255, blue / 255);
    } else if (roll > rangeMax) {
      // Синий цвет: чем больше значение, тем синее
      const intensity = Math.min(Math.abs(roll - rangeMax) / 45, 1);
      const red = Math.floor(100 * (1 - intensity));
      const green = Math.floor(100 * (1 - intensity));
      const blue = Math.floor(255);
      material.color.setRGB(red / 255, green / 255, blue / 255);
    } else {
      // Светло-зеленый в пределах диапазона
      material.color.setHex(0x22c55e);
    }
  }, [roll, pitch, rangeMin, rangeMax]);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
      <CardContent className="p-0 relative">
        <div
          ref={containerRef}
          className="w-full"
          style={{ minHeight: "500px" }}
        />

        {/* Sensor Data Overlay - Фиксированная ширина и увеличенный текст */}
        <div
          className="
    absolute top-4 left-1/2 -translate-x-1/2
    bg-slate-900/70 backdrop-blur-sm text-white
    rounded-xl border border-slate-700 shadow-xl
    w-[320px] sm:w-[360px] md:w-[420px] lg:w-[480px] xl:w-[520px]
    overflow-hidden
  "
        >
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Левая колонка - Roll и Pitch */}
              <div className="space-y-3">
                {/* <div className="space-y-1"> */}
                <div className="flex flex-col md:flex-row md:items-center  gap-1 md:gap-3">
                  <div className="text-slate-400 text-sm whitespace-nowrap">
                    Roll
                  </div>

                  <div className="font-mono font-bold text-2xl text-emerald-400 tabular-nums whitespace-nowrap">
                    {roll.toFixed(1)}°
                  </div>
                </div>
                {/* </div> */}
                {/* <div className="space-y-1"> */}
                <div className="flex flex-col md:flex-row md:items-center  gap-1 md:gap-3">
                  <div className="text-slate-400 text-sm">Pitch</div>
                  <div className="font-mono font-bold text-2xl text-blue-400 tabular-nums">
                    {pitch.toFixed(1)}°
                  </div>
                </div>
                {/* </div> */}
              </div>

              {/* Правая колонка - Диапазоны */}
              <div className="space-y-3">
                {/* <div className="space-y-1"> */}
                <div className="flex flex-col md:flex-row md:items-center  gap-1 md:gap-3">
                  <div className="text-slate-400 text-sm">Roll Range</div>
                  <div className="font-mono font-bold text-lg text-slate-300 tabular-nums">
                    {rangeMin}° to {rangeMax}°
                  </div>
                </div>
                {/* </div> */}
                {/* <div className="space-y-1"> */}
                <div className="flex flex-col md:flex-row md:items-center  gap-1 md:gap-3">
                  <div className="text-slate-400 text-sm">Pitch Range</div>
                  <div className="font-mono font-bold text-lg text-slate-300 tabular-nums">
                    {rangeMin}° to {rangeMax}°
                  </div>
                </div>
                {/* </div> */}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
