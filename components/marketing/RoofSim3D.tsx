"use client";

import { useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Edges, OrbitControls, Sparkles } from "@react-three/drei";
import styles from "./RoofSim3D.module.scss";

// Visual cap so the roof stays readable on huge areas (slider max keeps us
// well below this anyway). Mirrors the old SVG sim.
const MAX_SLOTS = 60;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* — Scene constants (world units) — */
const WALL_W = 3.2; // house width (x)
const WALL_D = 2.1; // house depth (z)
const WALL_H = 1.05; // eave height
const ROOF_TILT = 0.42; // mono-pitch angle (rad), rises to the back
const SUN_POS: [number, number, number] = [2.9, 3.3, -1.6];

/* Frosted-glass material shared by walls / roof deck / base. */
function useGlassMaterial(opacity: number) {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#cfe2f4",
        transparent: true,
        opacity,
        roughness: 0.18,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [opacity],
  );
}

/**
 * One roof cell: a translucent mounting slot that is always there, plus the
 * live panel that scales/glows in when `on`. Activation is staggered by
 * `delay` so panels sweep across the roof like the old SVG sim.
 */
function PanelCell({
  x,
  z,
  w,
  d,
  on,
  delay,
}: {
  x: number;
  z: number;
  w: number;
  d: number;
  on: boolean;
  delay: number;
}) {
  const panel = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null!);
  const anim = useRef({ v: 0, wait: 0, prevOn: false });

  useFrame((_, dt) => {
    const s = anim.current;
    if (on !== s.prevOn) {
      s.prevOn = on;
      s.wait = on ? delay : 0;
    }
    if (s.wait > 0) {
      s.wait -= dt;
    } else {
      s.v += ((on ? 1 : 0) - s.v) * Math.min(1, dt * 6);
    }
    const sc = 0.001 + s.v;
    panel.current.scale.set(sc, 1, sc);
    panel.current.visible = s.v > 0.02;
    if (mat.current) mat.current.emissiveIntensity = 0.4 * s.v;
  });

  return (
    <group position={[x, 0, z]}>
      {/* empty mounting slot */}
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[w * 0.94, 0.01, d * 0.9]} />
        <meshBasicMaterial color="#eef2f7" transparent opacity={0.14} />
      </mesh>
      {/* live panel */}
      <mesh ref={panel} position={[0, 0.035, 0]}>
        <boxGeometry args={[w * 0.94, 0.05, d * 0.9]} />
        <meshPhysicalMaterial
          ref={mat}
          color="#1c4a7a"
          roughness={0.16}
          metalness={0.35}
          clearcoat={1}
          clearcoatRoughness={0.12}
          emissive="#1f6fae"
          emissiveIntensity={0}
        />
        <Edges color="#dbeaff" threshold={30} />
      </mesh>
    </group>
  );
}

/** Sun sphere with a soft pulsing halo. */
function Sun() {
  const halo = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const s = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.06;
    halo.current.scale.setScalar(s);
  });
  return (
    <group position={SUN_POS}>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#ffce6b" />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshBasicMaterial color="#ffc24d" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Frosted glass house whose roof carries the panel grid. */
function House({ installed, max }: { installed: number; max: number }) {
  const slots = clamp(max, 1, MAX_SLOTS);
  const lit = clamp(installed, 0, slots);

  const cols = clamp(Math.ceil(Math.sqrt(slots * 1.7)), 3, 10);
  const rows = Math.ceil(slots / cols);
  const roofLen = WALL_D / Math.cos(ROOF_TILT) + 0.3; // slope length (z, local)
  const roofW = WALL_W + 0.24;

  const wallGlass = useGlassMaterial(0.16);
  const deckGlass = useGlassMaterial(0.22);
  const baseGlass = useGlassMaterial(0.12);

  const cells = useMemo(() => {
    const cw = roofW / cols;
    const cd = roofLen / rows;
    return Array.from({ length: slots }, (_, idx) => {
      const i = idx % cols;
      const j = Math.floor(idx / cols);
      return {
        idx,
        x: (i + 0.5) * cw - roofW / 2,
        z: (j + 0.5) * cd - roofLen / 2,
        w: cw,
        d: cd,
        delay: i * 0.045 + j * 0.06,
      };
    });
  }, [slots, cols, rows, roofW, roofLen]);

  // Whole house grows a little with the roof area, like the SVG sim did.
  const scale = 0.82 + 0.3 * clamp(slots / MAX_SLOTS, 0, 1);

  return (
    <group scale={scale}>
      {/* base slab */}
      <mesh position={[0, 0.04, 0]} material={baseGlass}>
        <boxGeometry args={[WALL_W + 0.7, 0.08, WALL_D + 0.7]} />
        <Edges color="#ffffff" threshold={30} />
      </mesh>

      {/* frosted walls */}
      <mesh position={[0, WALL_H / 2 + 0.08, 0]} material={wallGlass}>
        <boxGeometry args={[WALL_W, WALL_H, WALL_D]} />
        <Edges color="#ffffff" threshold={30} />
      </mesh>

      {/* warm interior glow */}
      <pointLight position={[0, WALL_H * 0.55, 0]} color="#ffc24d" intensity={3} distance={3.8} />
      <mesh position={[0, WALL_H * 0.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ffc24d" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* glass door with a gold knob */}
      <mesh position={[0, 0.34, WALL_D / 2 + 0.012]}>
        <boxGeometry args={[0.42, 0.56, 0.02]} />
        <meshPhysicalMaterial
          color="#ffd68a"
          transparent
          opacity={0.4}
          roughness={0.2}
          clearcoat={1}
        />
        <Edges color="#ffffff" threshold={30} />
      </mesh>
      <mesh position={[0.14, 0.32, WALL_D / 2 + 0.03]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#ffc24d" />
      </mesh>

      {/* lit window */}
      <mesh position={[-WALL_W / 2 - 0.012, WALL_H * 0.62, 0.3]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.42, 0.34]} />
        <meshBasicMaterial color="#ffc24d" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* mono-pitched roof: deck + panel grid, rising toward the back */}
      <group position={[0, WALL_H + 0.08 + 0.02, 0]} rotation={[ROOF_TILT, 0, 0]}>
        <mesh material={deckGlass}>
          <boxGeometry args={[roofW, 0.06, roofLen]} />
          <Edges color="#ffffff" threshold={30} />
        </mesh>
        <group position={[0, 0.045, 0]}>
          {cells.map((c) => (
            <PanelCell
              key={c.idx}
              x={c.x}
              z={c.z}
              w={c.w}
              d={c.d}
              on={c.idx < lit}
              delay={c.delay}
            />
          ))}
        </group>
      </group>
    </group>
  );
}

/**
 * Real-WebGL glassmorphic solar sim: frosted-glass house on a dark stage, sun
 * streaming sparkles onto a mono-pitched roof whose `max` mounting slots fill
 * with `installed` live panels. Drag to orbit; idles on a slow auto-rotate.
 */
export default function RoofSim3D({ installed, max }: { installed: number; max: number }) {
  const reduceMotion = useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  return (
    <div className={styles.scene} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [3.4, 2.5, 5.6], fov: 34 }}
        gl={{ antialias: true, alpha: true }}
        // pan-y keeps vertical page scroll alive over the canvas on touch.
        style={{ touchAction: "pan-y" }}
      >
        {/* key/fill/ambient lighting — warm sun, cool navy fill */}
        <ambientLight intensity={0.55} color="#9db8e0" />
        <directionalLight position={SUN_POS} intensity={1.7} color="#ffd98a" />
        <directionalLight position={[-3, 2, 3]} intensity={0.5} color="#6aa0ff" />

        <Sun />
        {/* sparkles drifting in the sun→roof light stream */}
        <Sparkles
          count={26}
          position={[1.4, 2.2, -0.6]}
          scale={[2.6, 1.8, 1.6]}
          size={2.6}
          speed={0.35}
          color="#ffd98a"
        />

        <House installed={installed} max={max} />

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.55}
          scale={9}
          blur={2.6}
          far={3}
          resolution={512}
          color="#020b18"
          frames={1}
        />

        <OrbitControls
          makeDefault
          autoRotate={!reduceMotion}
          autoRotateSpeed={0.9}
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={0.85}
          maxPolarAngle={1.35}
          target={[0, 0.75, 0]}
        />
      </Canvas>
    </div>
  );
}
