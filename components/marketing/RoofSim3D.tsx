"use client";

import { useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Edges, OrbitControls, RoundedBox, Sparkles } from "@react-three/drei";
import type { RoofPitch } from "@/lib/solar-config";
import styles from "./RoofSim3D.module.scss";

// Visual cap so the roof stays readable on huge areas (slider max keeps us
// well below this anyway). Mirrors the old SVG sim.
const MAX_SLOTS = 60;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* — Scene constants (world units) — */
const WALL_W = 3.1; // house width along the ridge (x)
const WALL_D = 2.2; // house depth (z)
const WALL_H = 1.0; // eave height
const ROOF_OVER = 0.3; // eave overhang beyond the wall (horizontal)
const ROOF_THICK = 0.07;
const BATTERY_POS: [number, number, number] = [1.72, 0.32, 1.15];

/* Gable angle per calculator pitch setting. */
const PITCH_ANGLE: Record<RoofPitch, number> = { flat: 0.16, moderate: 0.38, steep: 0.56 };

/* — Shared canvas textures (client-only module, lazy singletons) — */
let cellTex: THREE.CanvasTexture | null = null;
function getCellTexture() {
  if (cellTex) return cellTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#16406e";
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "#3d7fb8";
  g.lineWidth = 3;
  for (let i = 1; i < 4; i++) {
    g.beginPath();
    g.moveTo(i * 32, 0);
    g.lineTo(i * 32, 128);
    g.moveTo(0, i * 32);
    g.lineTo(128, i * 32);
    g.stroke();
  }
  g.strokeStyle = "#7cc7f4";
  g.lineWidth = 6;
  g.strokeRect(3, 3, 122, 122);
  cellTex = new THREE.CanvasTexture(c);
  cellTex.anisotropy = 4;
  return cellTex;
}

const iconTexCache: Partial<Record<"bolt" | "cloud", THREE.CanvasTexture>> = {};
function getIconTexture(kind: "bolt" | "cloud") {
  const hit = iconTexCache[kind];
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.shadowBlur = 14;
  if (kind === "bolt") {
    g.shadowColor = "#ffc24d";
    g.fillStyle = "#ffcf6e";
    g.beginPath();
    g.moveTo(72, 10);
    g.lineTo(36, 72);
    g.lineTo(60, 72);
    g.lineTo(52, 118);
    g.lineTo(94, 54);
    g.lineTo(68, 54);
    g.closePath();
    g.fill();
  } else {
    g.shadowColor = "#8fd6f2";
    g.fillStyle = "#c9ecfb";
    g.beginPath();
    g.arc(46, 74, 22, 0, Math.PI * 2);
    g.arc(70, 60, 26, 0, Math.PI * 2);
    g.arc(92, 76, 18, 0, Math.PI * 2);
    g.fill();
    g.fillRect(40, 74, 60, 20);
  }
  const tex = new THREE.CanvasTexture(c);
  iconTexCache[kind] = tex;
  return tex;
}

/* Frosted-glass material shared by walls / roof deck / battery shell. */
function useGlassMaterial(opacity: number, color = "#cfe2f4") {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        transparent: true,
        opacity,
        roughness: 0.28,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.25,
        iridescence: 0.55,
        iridescenceIOR: 1.3,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [opacity, color],
  );
}

/**
 * One roof cell: a translucent mounting slot that is always there, plus the
 * live panel that scales/glows in when `on`. Activation is staggered by
 * `delay` so panels sweep across the roof.
 */
function PanelCell({
  x,
  z,
  w,
  d,
  on,
  delay,
  showSlot,
}: {
  x: number;
  z: number;
  w: number;
  d: number;
  on: boolean;
  delay: number;
  /** Mounting pads only make sense once a system is being simulated. */
  showSlot: boolean;
}) {
  const panel = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null!);
  const anim = useRef({ v: 0, wait: 0, prevOn: false });
  const topMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: getCellTexture(), transparent: true, opacity: 0.92 }),
    [],
  );

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
    if (mat.current) mat.current.emissiveIntensity = 0.5 * s.v;
  });

  return (
    <group position={[x, 0, z]}>
      {/* empty mounting slot — outline only, so it reads the same from any angle */}
      {showSlot && (
        <mesh position={[0, 0.004, 0]}>
          <boxGeometry args={[w * 0.92, 0.008, d * 0.86]} />
          <meshBasicMaterial color="#eef2f7" transparent opacity={0.04} depthWrite={false} />
          <Edges color="#cfe0f2" threshold={30} transparent opacity={0.45} />
        </mesh>
      )}
      {/* live panel: dark cell body + solar-cell texture on top */}
      <group ref={panel} position={[0, 0.04, 0]}>
        <mesh>
          <boxGeometry args={[w * 0.92, 0.05, d * 0.85]} />
          <meshPhysicalMaterial
            ref={mat}
            color="#123a63"
            roughness={0.18}
            metalness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive="#2b8fd6"
            emissiveIntensity={0}
          />
          <Edges color="#bfe9ff" threshold={30} />
        </mesh>
        <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]} material={topMat}>
          <planeGeometry args={[w * 0.92, d * 0.85]} />
        </mesh>
      </group>
    </group>
  );
}

/** Small frosted badge with a glowing icon, pinned to the front wall. */
function Badge({ kind, position }: { kind: "bolt" | "cloud"; position: [number, number, number] }) {
  const glass = useGlassMaterial(0.55, "#dcebfa");
  return (
    <group position={position}>
      <RoundedBox args={[0.26, 0.26, 0.05]} radius={0.05} smoothness={4} material={glass} />
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshBasicMaterial map={getIconTexture(kind)} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

const BATTERY_SEGS = 6;

/** Frosted battery pack: fully glowing energy stack (same visual language as
 * the lit panels), pulsing bolt, terminals. */
function Battery({ reduceMotion }: { reduceMotion: boolean }) {
  const shell = useGlassMaterial(0.5, "#d5e7f8");
  const bolt = useRef<THREE.MeshBasicMaterial>(null!);

  const segMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#6fe7ff", transparent: true, opacity: 0.85, depthWrite: false }),
    [],
  );

  useFrame(({ clock }) => {
    const p = reduceMotion ? 1 : 0.75 + Math.sin(clock.elapsedTime * 2.6) * 0.25;
    if (bolt.current) bolt.current.opacity = p;
    segMat.opacity = 0.6 + 0.3 * p;
  });

  const segH = 0.062;
  const gap = 0.014;

  return (
    <group position={BATTERY_POS} rotation={[0, -0.3, 0]}>
      <RoundedBox args={[0.56, 0.62, 0.44]} radius={0.07} smoothness={4} material={shell} />
      {/* glowing energy stack */}
      {Array.from({ length: BATTERY_SEGS }, (_, i) => (
        <mesh key={i} position={[0, -0.22 + i * (segH + gap) + segH / 2, 0]} material={segMat}>
          <boxGeometry args={[0.4, segH, 0.28]} />
        </mesh>
      ))}
      {/* bolt icon */}
      <mesh position={[0, 0.02, 0.226]}>
        <planeGeometry args={[0.22, 0.28]} />
        <meshBasicMaterial
          ref={bolt}
          map={getIconTexture("bolt")}
          color="#d9f6ff"
          transparent
          depthWrite={false}
        />
      </mesh>
      {/* terminals */}
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, 0.35, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.09, 16]} />
          <meshPhysicalMaterial color="#a9c4de" roughness={0.3} clearcoat={1} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Neon cable from the panel field into the battery, with traveling pulses. */
function EnergyFlow({
  tilt,
  active,
  reduceMotion,
}: {
  tilt: number;
  active: boolean;
  reduceMotion: boolean;
}) {
  // Hugs the house like the reference render: from the panel field, over the
  // eave, straight down the wall, a short run on the stage, then a J-curve up
  // into the battery's top terminals. Follows the roof line for any pitch.
  const curve = useMemo(() => {
    const tan = Math.tan(tilt);
    const ridgeY = WALL_H + tan * (WALL_D / 2);
    const eaveZ = WALL_D / 2 + ROOF_OVER;
    const roofY = (z: number) => ridgeY - tan * z;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.15, roofY(0.9) + 0.1, 0.9),
      new THREE.Vector3(1.32, roofY(eaveZ) + 0.05, eaveZ + 0.05),
      new THREE.Vector3(1.45, 0.5, WALL_D / 2 + 0.16),
      new THREE.Vector3(1.52, 0.1, WALL_D / 2 + 0.42),
      new THREE.Vector3(1.62, 0.09, 1.05),
      new THREE.Vector3(BATTERY_POS[0] - 0.02, 0.66, BATTERY_POS[2] + 0.01),
    ]);
  }, [tilt]);

  const pulses = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    pulses.current.forEach((m, i) => {
      if (!m) return;
      const t = reduceMotion ? i / 3 : (clock.elapsedTime * 0.22 + i / 3) % 1;
      m.position.copy(curve.getPointAt(t));
      m.visible = active;
    });
  });

  if (!active) return null;
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.016, 8, false]} />
        <meshBasicMaterial color="#62e0ff" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      {/* soft halo around the cable */}
      <mesh>
        <tubeGeometry args={[curve, 64, 0.04, 8, false]} />
        <meshBasicMaterial
          color="#62e0ff"
          transparent
          opacity={0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) pulses.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.034, 12, 12]} />
          <meshBasicMaterial color="#eafcff" depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Frosted glass gable house. The roof is built as two slabs that rest on the
 * gable slopes and meet at the ridge, so it can never intersect the walls.
 */
function House({
  installed,
  max,
  tilt,
  batteryKwh,
  reduceMotion,
}: {
  installed: number;
  max: number;
  tilt: number;
  batteryKwh: number;
  reduceMotion: boolean;
}) {
  const slots = clamp(max, 1, MAX_SLOTS);
  const lit = clamp(installed, 0, slots);

  const ridgeY = WALL_H + Math.tan(tilt) * (WALL_D / 2);
  const run = WALL_D / 2 + ROOF_OVER; // ridge → eave edge, horizontal
  const slope = run / Math.cos(tilt); // slab length along the slope
  const lift = ROOF_THICK / 2 / Math.cos(tilt) + 0.012;
  const slabZ = run / 2;
  const slabY = ridgeY - Math.tan(tilt) * slabZ + lift;
  const roofW = WALL_W + 0.45;

  const wallGlass = useGlassMaterial(0.42);
  const deckGlass = useGlassMaterial(0.62);

  // Pentagon cross-section extruded along the ridge — gable walls in one mesh.
  const wallGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-WALL_D / 2, 0);
    s.lineTo(WALL_D / 2, 0);
    s.lineTo(WALL_D / 2, WALL_H);
    s.lineTo(0, ridgeY);
    s.lineTo(-WALL_D / 2, WALL_H);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: WALL_W, bevelEnabled: false });
    geo.translate(0, 0, -WALL_W / 2);
    geo.rotateY(Math.PI / 2);
    return geo;
  }, [ridgeY]);

  // Whole grid lives on the front slope — panels showing through the frosted
  // glass from the far slope read as confusing ghost patches. Cells are
  // portrait (taller down the slope than wide) and fill column-major, so new
  // panels stack below each other instead of forming a long sideways band.
  const cells = useMemo(() => {
    const rows = clamp(Math.round(Math.sqrt(slots / 2.6)), 2, 5);
    const cols = Math.ceil(slots / rows);
    const cw = Math.min((WALL_W * 0.92) / cols, 0.5);
    const cd = Math.min((slope * 0.78) / rows, 0.62);
    const ridgeMargin = 0.14;
    return Array.from({ length: slots }, (_, idx) => {
      const col = Math.floor(idx / rows);
      const row = idx % rows;
      const along = ridgeMargin + (row + 0.5) * cd;
      return {
        idx,
        x: (col + 0.5) * cw - (cw * cols) / 2,
        z: -slope / 2 + along, // ridge sits at -slope/2 on the front slab
        w: cw,
        d: cd,
        delay: row * 0.07 + col * 0.05,
      };
    });
  }, [slots, slope]);

  // Whole diorama grows a little with the roof area, like the SVG sim did.
  const scale = 0.8 + 0.28 * clamp(slots / MAX_SLOTS, 0, 1);

  return (
    <group scale={scale}>
      {/* gable walls */}
      <mesh geometry={wallGeo} material={wallGlass}>
        <Edges color="#ffffff" threshold={30} />
      </mesh>

      {/* frosted glass door with a small gold knob */}
      <mesh position={[-0.35, 0.34, WALL_D / 2 + 0.012]}>
        <boxGeometry args={[0.42, 0.56, 0.02]} />
        <meshPhysicalMaterial color="#e3eefb" transparent opacity={0.5} roughness={0.2} clearcoat={1} />
        <Edges color="#ffffff" threshold={30} />
      </mesh>
      <mesh position={[-0.21, 0.32, WALL_D / 2 + 0.03]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#ffc24d" />
      </mesh>

      {/* wall badges, reference-style */}
      <Badge kind="bolt" position={[1.05, 0.58, WALL_D / 2 + 0.03]} />
      <Badge kind="cloud" position={[1.05, 0.24, WALL_D / 2 + 0.03]} />

      {/* gable roof: two slabs resting on the slopes, meeting at the ridge */}
      {[1, -1].map((side) => (
        <group
          key={side}
          position={[0, slabY, side * slabZ]}
          rotation={[side * tilt, 0, 0]}
        >
          <mesh material={deckGlass}>
            <boxGeometry args={[roofW, ROOF_THICK, slope]} />
            <Edges color="#ffffff" threshold={30} />
          </mesh>
          {side === 1 && (
            <group position={[0, ROOF_THICK / 2 + 0.01, 0]}>
              {cells.map((c) => (
                <PanelCell
                  key={c.idx}
                  x={c.x}
                  z={c.z}
                  w={c.w}
                  d={c.d}
                  on={c.idx < lit}
                  delay={c.delay}
                  showSlot={lit > 0}
                />
              ))}
            </group>
          )}
        </group>
      ))}

      {/* ridge cap hides the slab seam */}
      <mesh position={[0, ridgeY + lift + 0.015, 0]} material={deckGlass}>
        <boxGeometry args={[roofW + 0.05, 0.07, 0.16]} />
        <Edges color="#ffffff" threshold={30} />
      </mesh>

      {/* storage: battery + flowing energy, only when a pack is selected */}
      {batteryKwh > 0 && (
        <>
          <Battery reduceMotion={reduceMotion} />
          <EnergyFlow tilt={tilt} active={lit > 0} reduceMotion={reduceMotion} />
        </>
      )}
    </group>
  );
}

/** Rounded frosted-glass stage the diorama sits on. */
function Stage() {
  const glass = useGlassMaterial(0.4, "#9fbcdc");
  return (
    <RoundedBox
      args={[5.3, 0.22, 4.1]}
      radius={0.1}
      smoothness={6}
      position={[0, -0.11, 0]}
      material={glass}
    />
  );
}

export type SimCard = { label: string; value: string };

/**
 * Real-WebGL glassmorphic solar sim: frosted gable house on a rounded lawn
 * stage, panels sweeping in across both roof slopes, optional battery pack
 * fed by a glowing cable, and floating glass stat cards. Rotates only when
 * the user drags.
 */
export default function RoofSim3D({
  installed,
  max,
  pitch = "moderate",
  batteryKwh = 0,
  cards,
}: {
  installed: number;
  max: number;
  pitch?: RoofPitch;
  batteryKwh?: number;
  cards?: SimCard[];
}) {
  const reduceMotion = useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  const tilt = PITCH_ANGLE[pitch];

  return (
    <div className={styles.scene} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [5.3, 3.6, 6.2], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        // pan-y keeps vertical page scroll alive over the canvas on touch.
        style={{ touchAction: "pan-y" }}
      >
        {/* key/fill/ambient lighting — warm key, cool navy fill */}
        <ambientLight intensity={0.5} color="#a9c2e8" />
        <directionalLight position={[3.5, 4.5, 2.5]} intensity={1.35} color="#ffd98a" />
        <directionalLight position={[-4, 2.5, -2]} intensity={0.55} color="#7db2ff" />

        {/* cool dust drifting above the roof, reference-style */}
        <Sparkles
          count={30}
          position={[0.4, 2.2, 0]}
          scale={[2.8, 1.3, 2]}
          size={2}
          speed={reduceMotion ? 0 : 0.28}
          opacity={0.7}
          color="#d9f2ff"
        />

        <House
          installed={installed}
          max={max}
          tilt={tilt}
          batteryKwh={batteryKwh}
          reduceMotion={reduceMotion}
        />

        {/* rounded frosted-glass stage */}
        <Stage />

        <ContactShadows
          position={[0, 0.002, 0]}
          opacity={0.5}
          scale={7.5}
          blur={2.4}
          far={2.5}
          resolution={512}
          color="#020a16"
        />

        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={0.85}
          maxPolarAngle={1.35}
          target={[0, 0.72, 0]}
        />
      </Canvas>

      {/* glass stat cards pinned to the left, reference-style */}
      {cards && cards.length > 0 && (
        <div className={styles.cards}>
          {cards.map((c) => (
            <div className={styles.card} key={c.label}>
              <span>{c.label}</span>
              <strong>{c.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
