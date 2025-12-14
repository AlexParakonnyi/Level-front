// components/LevelBox3D.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";

interface LevelBox3DProps {
  roll: number;
  pitch: number;
  rollRangeMin: number;
  rollRangeMax: number;
  pitchRangeMin: number;
  pitchRangeMax: number;
  showPitch: boolean;
}

export function LevelBox3D({
  roll,
  pitch,
  rollRangeMin,
  rollRangeMax,
  pitchRangeMin,
  pitchRangeMax,
  showPitch,
}: LevelBox3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    box: THREE.Mesh;
    gridHelper: THREE.GridHelper;
    frontFace: THREE.Mesh;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0.5, -0.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(10, 10, 0x4b5563, 0x374151);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    const geometry = new THREE.BoxGeometry(3, 1, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.95,
    });

    const box = new THREE.Mesh(geometry, material);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    box.add(wireframe);

    const faceGeometry = new THREE.PlaneGeometry(3, 1);
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      metalness: 0.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const frontFace = new THREE.Mesh(faceGeometry, faceMaterial);
    frontFace.position.set(0, 0, 1.01);
    box.add(frontFace);

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

    sceneRef.current = { scene, camera, renderer, box, gridHelper, frontFace };

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      sceneRef.current.camera.aspect = newWidth / height;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(newWidth, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    const { box, frontFace } = sceneRef.current;

    const rollRad = (roll * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    box.rotation.z = rollRad;
    box.rotation.x = pitchRad;

    const material = box.material as THREE.MeshStandardMaterial;
    const faceMaterial = frontFace.material as THREE.MeshStandardMaterial;

    const rollOutOfRange = roll < rollRangeMin || roll > rollRangeMax;
    const pitchOutOfRange = pitch < pitchRangeMin || pitch > pitchRangeMax;

    if (rollOutOfRange) {
      if (roll < rollRangeMin) {
        const intensity = Math.min(Math.abs(roll - rollRangeMin) / 45, 1);
        const red = 255;
        const green = Math.floor(100 * (1 - intensity));
        const blue = Math.floor(100 * (1 - intensity));
        material.color.setRGB(red / 255, green / 255, blue / 255);
      } else if (roll > rollRangeMax) {
        const intensity = Math.min(Math.abs(roll - rollRangeMax) / 45, 1);
        const red = Math.floor(100 * (1 - intensity));
        const green = Math.floor(100 * (1 - intensity));
        const blue = 255;
        material.color.setRGB(red / 255, green / 255, blue / 255);
      }
    } else {
      material.color.setHex(0x22c55e);
    }

    if (showPitch) {
      if (pitchOutOfRange) {
        if (pitch < pitchRangeMin) {
          const intensity = Math.min(Math.abs(pitch - pitchRangeMin) / 45, 1);
          const red = 255;
          const green = Math.floor(100 * (1 - intensity));
          const blue = Math.floor(100 * (1 - intensity));
          faceMaterial.color.setRGB(red / 255, green / 255, blue / 255);
        } else if (pitch > pitchRangeMax) {
          const intensity = Math.min(Math.abs(pitch - pitchRangeMax) / 45, 1);
          const red = Math.floor(100 * (1 - intensity));
          const green = Math.floor(100 * (1 - intensity));
          const blue = 255;
          faceMaterial.color.setRGB(red / 255, green / 255, blue / 255);
        }
      } else {
        faceMaterial.color.setHex(0x22c55e);
      }
    } else {
      faceMaterial.color.copy(material.color);
    }
  }, [
    roll,
    pitch,
    rollRangeMin,
    rollRangeMax,
    pitchRangeMin,
    pitchRangeMax,
    showPitch,
  ]);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
      <CardContent className="p-0 relative">
        <div
          ref={containerRef}
          className="w-full"
          style={{ minHeight: "500px" }}
        />

        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-slate-900/70 backdrop-blur-sm text-white rounded-xl border border-slate-700 shadow-xl w-[280px] sm:w-[400px] md:w-[600px]">
            <div className="p-4 sm:p-5">
              {/* Адаптивная разметка */}
              <div className={showPitch ? "space-y-4 sm:space-y-0" : ""}>
                {/* Roll строка */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  {/* Левая часть - Roll значение */}
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <div
                      className="text-slate-400 text-sm sm:text-base"
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      Roll
                    </div>
                    <div className="font-mono font-bold text-2xl sm:text-3xl text-emerald-400 tabular-nums">
                      {roll.toFixed(1)}°
                    </div>
                  </div>

                  {/* Правая часть - Roll Range */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="text-slate-400 text-xs sm:text-sm"
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      Roll Range:
                    </div>
                    <div className="font-mono font-semibold text-sm sm:text-base text-slate-300 tabular-nums">
                      {rollRangeMin}° to {rollRangeMax}°
                    </div>
                  </div>
                </div>

                {/* Pitch строка */}
                {showPitch && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-2 sm:pt-0 sm:border-t-0 border-t border-slate-700/50 sm:border-none">
                    {/* Левая часть - Pitch значение */}
                    <div className="flex items-baseline gap-2 sm:gap-3">
                      <div
                        className="text-slate-400 text-sm sm:text-base"
                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                      >
                        Pitch
                      </div>
                      <div className="font-mono font-bold text-2xl sm:text-3xl text-blue-400 tabular-nums">
                        {pitch.toFixed(1)}°
                      </div>
                    </div>

                    {/* Правая часть - Pitch Range */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="text-slate-400 text-xs sm:text-sm"
                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                      >
                        Pitch Range:
                      </div>
                      <div className="font-mono font-semibold text-sm sm:text-base text-slate-300 tabular-nums">
                        {pitchRangeMin}° to {pitchRangeMax}°
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
