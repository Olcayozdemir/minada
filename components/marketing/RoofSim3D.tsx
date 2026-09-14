"use client";

import { useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Edges, Line, OrbitControls, RoundedBox } from "@react-three/drei";
import { SolarVillaDetails } from "./SolarVillaDetails";
import type { Line2, LineSegments2 } from "three-stdlib";
import type { Orientation, RoofPitch } from "@/lib/solar-config";
import styles from "./RoofSim3D.module.scss";

// Visual cap so the roof stays readable on huge areas (slider max keeps us
// well below this anyway). Mirrors the old SVG sim.
const MAX_SLOTS = 60;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* — Scene constants (world units) — */
const WALL_H = 1.35; // eave height
const ROOF_OVER = 0.3; // eave overhang beyond the wall (horizontal)
const ROOF_THICK = 0.07;

/* Gable angle per calculator pitch setting. "Düz" gerçekten düz: 0. */
const PITCH_ANGLE: Record<RoofPitch, number> = { flat: 0, moderate: 0.38, steep: 0.56 };

/* Seçilen yöne göre güneşin sahnedeki yeri. Panelli yamaç +z'ye (güneye)
   bakar: Güney'de güneş tam karşıda ve yüksekte, GD/GB'de köşede,
   Doğu-Batı'da yandan (mahya doğrultusunda) vurur. */
const SUN_POS: Record<Orientation, [number, number, number]> = {
  south: [0.5, 2.7, 2.1],
  southNorth: [2.3, 2.5, 1.5], // köşeden — çatının iki yamacı da pay alır
  eastWest: [3.2, 2.2, -0.5],
};

/* — Shared canvas textures (client-only module, lazy singletons) — */
let cellTex: THREE.CanvasTexture | null = null;
function getCellTexture() {
  if (cellTex) return cellTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#203447";
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "#536d87";
  g.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    g.beginPath();
    g.moveTo(i * 32, 0);
    g.lineTo(i * 32, 128);
    g.moveTo(0, i * 32);
    g.lineTo(128, i * 32);
    g.stroke();
  }
  g.strokeStyle = "#a4b0bc";
  g.lineWidth = 4;
  g.strokeRect(3, 3, 122, 122);
  cellTex = new THREE.CanvasTexture(c);
  cellTex.anisotropy = 4;
  return cellTex;
}

/* Radial-gradient glow sprite for the sun's halo. */
let glowTex: THREE.CanvasTexture | null = null;
function getGlowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255, 150, 35, 0.55)");
  grad.addColorStop(0.35, "rgba(255, 171, 55, 0.25)");
  grad.addColorStop(1, "rgba(255, 183, 80, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

let sunDiscTex: THREE.CanvasTexture | null = null;
function getSunDiscTexture() {
  if (sunDiscTex) return sunDiscTex;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(48, 42, 4, 64, 64, 61);
  gradient.addColorStop(0, "#fff1c2");
  gradient.addColorStop(0.45, "#ffd16a");
  gradient.addColorStop(0.85, "#ffac37");
  gradient.addColorStop(1, "#f18a24");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(64, 64, 61, 0, Math.PI * 2);
  ctx.fill();
  sunDiscTex = new THREE.CanvasTexture(canvas);
  sunDiscTex.colorSpace = THREE.SRGBColorSpace;
  return sunDiscTex;
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
    if (mat.current) mat.current.emissiveIntensity = 0.025 * s.v;
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
          <Edges color="#88979e" threshold={30} />
        </mesh>
        <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]} material={topMat}>
          <planeGeometry args={[w * 0.92, d * 0.85]} />
        </mesh>
      </group>
    </group>
  );
}

/** The moving markers indicate direction, not a measured charging rate. */
function BatteryFlow({ width, depth, eaveHeight, tilt, reduceMotion }: { width: number; depth: number; eaveHeight: number; tilt: number; reduceMotion: boolean }) {
  const markers = useRef<Array<THREE.Mesh | null>>([]);
  const curve = useMemo(() => {
    const z = depth / 2 - 0.22;
    const roofY = eaveHeight + Math.tan(tilt) * (depth / 2 - z) + 0.1;
    const path = new THREE.CurvePath<THREE.Vector3>();
    path.add(new THREE.LineCurve3(
      new THREE.Vector3(width * 0.05, eaveHeight + Math.tan(tilt) * (depth / 2 - 0.2) + 0.1, 0.2), new THREE.Vector3(width / 2 + 0.34, roofY, z),
    ));
    path.add(new THREE.LineCurve3(
      new THREE.Vector3(width / 2 + 0.34, roofY, z), new THREE.Vector3(width / 2 + 0.34, 0.92, z),
    ));
    path.add(new THREE.LineCurve3(
      new THREE.Vector3(width / 2 + 0.34, 0.92, z), new THREE.Vector3(width / 2 + 0.15, 0.86, z),
    ));
    return path;
  }, [width, depth, eaveHeight, tilt]);
  const points = useMemo(() => curve.getPoints(40), [curve]);
  useFrame(({ clock }) => {
    markers.current.forEach((marker, i) => {
      if (marker) curve.getPointAt(reduceMotion ? (i + 1) / 4 : (clock.elapsedTime * 0.22 + i / 3) % 1, marker.position);
    });
  });
  return <group>
    <Line points={points} color="#c99736" lineWidth={1.5} transparent opacity={0.7} />
    {[0, 1, 2].map((i) => <mesh key={i} ref={(mesh) => { markers.current[i] = mesh; }}>
      <sphereGeometry args={[0.035, 12, 12]} />
      <meshBasicMaterial color="#ffb62e" toneMapped={false} />
    </mesh>)}
  </group>;
}

/** Matte wall-mounted modules: one enclosure per 5 kWh, not a charge gauge. */
function Battery({ capacity, width, depth, eaveHeight }: { capacity: number; width: number; depth: number; eaveHeight: number }) {
  const modules = Math.min(3, Math.ceil(capacity / 5));
  return (
    <group position={[width / 2 + 0.065, 0.53, depth / 2 - 0.22]} rotation={[0, Math.PI / 2, 0]}>
      {Array.from({ length: modules }, (_, i) => (
        <group key={i} position={[i * 0.29, 0, 0]}>
          <RoundedBox args={[0.25, 0.66, 0.14]} radius={0.025} smoothness={3} castShadow receiveShadow>
            <meshStandardMaterial color="#e9e9e3" roughness={0.78} metalness={0.08} />
          </RoundedBox>
          <mesh position={[0, 0.23, 0.073]}><boxGeometry args={[0.14, 0.028, 0.008]} /><meshStandardMaterial color="#344340" /></mesh>
          <mesh position={[0, -0.23, 0.073]}><boxGeometry args={[0.16, 0.05, 0.008]} /><meshStandardMaterial color="#b5bdb6" /></mesh>
          {[-1, 0, 1].map((slot) => <mesh key={slot} position={[slot * 0.04, -0.23, 0.079]}><boxGeometry args={[0.018, 0.025, 0.003]} /><meshStandardMaterial color="#59645e" /></mesh>)}
        </group>
      ))}
      <Line points={[[0, 0.35, -0.018], [0, eaveHeight - 0.49, -0.018]]} color="#626c65" lineWidth={1.5} />
      {modules > 1 && <Line points={[[0, -0.38, 0], [(modules - 1) * 0.29, -0.38, 0]]} color="#626c65" lineWidth={1.5} />}
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
  roofAreaM2,
  tilt,
  batteryKwh,
  reduceMotion,
}: {
  installed: number;
  max: number;
  roofAreaM2: number;
  tilt: number;
  batteryKwh: number;
  reduceMotion: boolean;
}) {
  const slots = clamp(max, 1, MAX_SLOTS);
  const growth = clamp((roofAreaM2 - 10) / 110, 0, 1);
  const WALL_W = 2.2 + growth * 1.4;
  const WALL_D = 1.65 + growth * 1.05;
  const lit = clamp(installed, 0, slots);
  const upperFloor = roofAreaM2 >= 72;
  const floorOffset = upperFloor ? 1.05 : 0;
  const eaveHeight = WALL_H + floorOffset;

  // Düz seçiminde beşik çatı yerine teras: tek yatay döşeme + alçak parapet,
  // mahya ve ikinci yamaç hiç kurulmaz.
  const isFlat = tilt === 0;
  const flatDepth = WALL_D + ROOF_OVER * 2;

  const ridgeY = eaveHeight + Math.tan(tilt) * (WALL_D / 2);
  const run = WALL_D / 2 + ROOF_OVER; // ridge → eave edge, horizontal
  const slope = run / Math.cos(tilt); // slab length along the slope
  const lift = ROOF_THICK / 2 / Math.cos(tilt) + 0.012;
  const slabZ = run / 2;
  const slabY = ridgeY - Math.tan(tilt) * slabZ + lift;
  const roofW = WALL_W + 0.45;

  const wallGlass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f4f1ea", roughness: 0.85 }), []);
  const deckGlass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#38424e", roughness: 0.7 }), []);

  // Pentagon cross-section extruded along the ridge — gable walls in one mesh.
  const wallGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-WALL_D / 2, 0);
    s.lineTo(WALL_D / 2, 0);
    s.lineTo(WALL_D / 2, eaveHeight);
    s.lineTo(0, ridgeY);
    s.lineTo(-WALL_D / 2, eaveHeight);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: WALL_W, bevelEnabled: false });
    geo.translate(0, 0, -WALL_W / 2);
    geo.rotateY(Math.PI / 2);
    return geo;
  }, [ridgeY, eaveHeight, WALL_W, WALL_D]);

  // Whole grid lives on the front slope — panels showing through the frosted
  // glass from the far slope read as confusing ghost patches. Cells are
  // portrait (taller down the slope than wide) and fill column-major, so new
  // panels stack below each other instead of forming a long sideways band.
  const cells = useMemo(() => {
    // One roof, with a fixed module grid sized for the full visual capacity.
    const cols = Math.floor((WALL_W - 0.15) / 0.24);
    return Array.from({ length: slots }, (_, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        idx,
        x: (col + 0.5 - cols / 2) * 0.24,
        z: isFlat ? (row - 2) * 0.27 : -slope / 2 + 0.12 + (row + 0.5) * 0.27,
        w: 0.24,
        d: 0.27,
        delay: row * 0.07 + col * 0.05,
      };
    });
  }, [slots, slope, isFlat, WALL_W]);

  return (
    <group>
      {/* gable walls */}
      <mesh geometry={wallGeo} material={wallGlass} castShadow receiveShadow />
      <SolarVillaDetails width={WALL_W} depth={WALL_D} height={WALL_H} upperFloor={upperFloor} />


      {isFlat ? (
        /* teras çatı: tek yatay döşeme + alçak parapet, mahya yok */
        <group position={[0, eaveHeight + ROOF_THICK / 2 + 0.012, 0]}>
          <mesh material={deckGlass}>
            <boxGeometry args={[roofW, ROOF_THICK, flatDepth]} />
            <Edges color="#ffffff" threshold={30} />
          </mesh>
          {[1, -1].map((s) => (
            <mesh key={`p${s}`} position={[0, ROOF_THICK / 2 + 0.05, s * (flatDepth / 2 - 0.025)]} material={deckGlass}>
              <boxGeometry args={[roofW, 0.1, 0.05]} />
              <Edges color="#ffffff" threshold={30} />
            </mesh>
          ))}
          {[1, -1].map((s) => (
            <mesh key={`s${s}`} position={[s * (roofW / 2 - 0.025), ROOF_THICK / 2 + 0.05, 0]} material={deckGlass}>
              <boxGeometry args={[0.05, 0.1, flatDepth - 0.1]} />
              <Edges color="#ffffff" threshold={30} />
            </mesh>
          ))}
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
                showSlot={false}
              />
            ))}
          </group>
        </group>
      ) : (
        <>
          {/* gable roof: two slabs resting on the slopes, meeting at the ridge */}
          {[1, -1].map((side) => (
            <group
              key={side}
              position={[0, slabY, side * slabZ]}
              rotation={[side * tilt, 0, 0]}
            >
              <mesh material={deckGlass} castShadow receiveShadow>
                <boxGeometry args={[roofW, ROOF_THICK, slope]} />
              </mesh>
              {Array.from({ length: 23 }, (_, i) => (
                <mesh key={`seam-${i}`} position={[-roofW / 2 + 0.075 + i * (roofW - 0.15) / 22, ROOF_THICK / 2 + 0.006, 0]} material={deckGlass}>
                  <boxGeometry args={[0.012, 0.012, slope]} />
                </mesh>
              ))}
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
                      showSlot={false}
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
        </>
      )}

      {/* storage: battery + flowing energy, only when a pack is selected */}
      {batteryKwh > 0 && (
        <>
          <Battery capacity={batteryKwh} width={WALL_W} depth={WALL_D} eaveHeight={eaveHeight} />
          {lit > 0 && <BatteryFlow width={WALL_W} depth={WALL_D} eaveHeight={eaveHeight} tilt={tilt} reduceMotion={reduceMotion} />}
        </>
      )}
    </group>
  );
}

/* Işınların çatı üstünde nişan aldığı noktalar (dünya uzayı) — panel alanına
   yayılmış dört hedef. */
const RAY_TARGETS: ReadonlyArray<[number, number, number]> = [
  [-1.0, 1.3, 0.55],
  [-0.25, 1.35, 0.15],
  [0.55, 1.3, 0.6],
  [1.1, 1.25, -0.1],
];

/**
 * Görünür güneş: altın küre + halo + panellere doğru çizgi halinde akan
 * ışınlar; sıcak key ışığı da içinde taşır. Yön değişince yeni konuma
 * yumuşakça süzülür (ilk konum prop olarak sabit kalır, hareketi tamamen
 * useFrame sürer — böylece re-render pozisyonu zıplatmaz).
 */
function Sun({ orientation, reduceMotion, floorOffset = 0 }: { orientation: Orientation; reduceMotion: boolean; floorOffset?: number }) {
  const group = useRef<THREE.Group>(null!);
  const rayRefs = useRef<(Line2 | LineSegments2)[]>([]);
  const target = useMemo(() => new THREE.Vector3(...SUN_POS[orientation]).add(new THREE.Vector3(0, floorOffset, 0)), [orientation, floorOffset]);

  // Işınlar grup içinde (yerel uzay): güneş merkezinden çatı hedefine, halo
  // dışından başlayıp çatının hemen üstünde biter. Yön değişince hedefler
  // yeni güneş konumuna göre yeniden kurulur.
  const rays = useMemo(() => {
    const sun = new THREE.Vector3(...SUN_POS[orientation]);
    return RAY_TARGETS.map((t) => {
      const local = new THREE.Vector3(...t).sub(sun);
      return [local.clone().multiplyScalar(0.24), local.clone().multiplyScalar(0.95)] as [
        THREE.Vector3,
        THREE.Vector3,
      ];
    });
  }, [orientation]);

  useFrame((_, dt) => {
    if (!group.current) return;
    if (reduceMotion) group.current.position.copy(target);
    else {
      group.current.position.lerp(target, Math.min(1, dt * 3.5));
      // ışık, çizgiler halinde güneşten panele doğru aksın
      rayRefs.current.forEach((l) => {
        if (l?.material) l.material.dashOffset -= dt * 0.7;
      });
    }
  });

  return (
    <group ref={group} position={SUN_POS.south}>
      <sprite scale={[0.4, 0.4, 1]} renderOrder={2}>
        <spriteMaterial map={getSunDiscTexture()} transparent depthWrite={false} toneMapped={false} />
      </sprite>
      <sprite scale={[1.05, 1.05, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
      {rays.map((pts, i) => (
        <Line
          key={i}
          ref={(l) => {
            if (l) rayRefs.current[i] = l;
          }}
          points={pts}
          color="#efa331"
          lineWidth={1}
          dashed
          dashSize={0.16}
          gapSize={0.24}
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      ))}
      {/* sıcak key ışık güneşle birlikte gezer; hedefi sahne merkezi */}
      <directionalLight position={[0, 0, 0]} intensity={3} color="#fff0d6" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-near={0.1} shadow-camera-far={20} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.0005} shadow-normalBias={0.02} shadow-radius={3} />
    </group>
  );
}

/** Rounded frosted-glass stage the diorama sits on. */
function Stage() {
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d8decf", roughness: 1 }), []);
  return (
    <RoundedBox
      args={[5.3, 0.22, 4.1]}
      radius={0.1}
      smoothness={6}
      position={[0, -0.11, 0]}
      material={glass}
      receiveShadow
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
  roofAreaM2 = 60,
  pitch = "moderate",
  orientation = "south",
  batteryKwh = 0,
  cards,
}: {
  installed: number;
  max: number;
  roofAreaM2?: number;
  pitch?: RoofPitch;
  orientation?: Orientation;
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
        shadows
        dpr={[1, 2]}
        camera={{ position: [6.5, 5.8, 7.4], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        // pan-y keeps vertical page scroll alive over the canvas on touch.
        style={{ touchAction: "pan-y" }}
      >
        {/* ambient + cool navy fill; sıcak key ışık Sun'ın içinde, yönle gezer */}
        <ambientLight intensity={0.8} color="#ffffff" />
        <hemisphereLight args={["#e4edf5", "#b7ac96", 0.8]} />
        <Sun orientation={orientation} reduceMotion={reduceMotion} floorOffset={roofAreaM2 >= 72 ? 1.05 : 0} />

        <House
          installed={installed}
          max={max}
          roofAreaM2={roofAreaM2}
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
          target={[0, 1.05, 0]}
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
