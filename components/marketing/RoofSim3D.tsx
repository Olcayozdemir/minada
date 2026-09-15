"use client";

import { useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
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
  south: [-1.35, 2.9, 2.15],
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
    g.stroke();
  }
  for (let i = 1; i < 6; i++) {
    g.beginPath();
    const y = (i * 128) / 6;
    g.moveTo(0, y);
    g.lineTo(128, y);
    g.stroke();
  }
  g.strokeStyle = "#a4b0bc";
  g.lineWidth = 4;
  g.strokeRect(3, 3, 122, 122);
  cellTex = new THREE.CanvasTexture(c);
  cellTex.anisotropy = 4;
  return cellTex;
}

let grassTex: THREE.CanvasTexture | null = null;
function getGrassTexture() {
  if (grassTex) return grassTex;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#88ad70";
  ctx.fillRect(0, 0, 256, 256);

  let seed = 1847;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < 360; i += 1) {
    const x = random() * 256;
    const y = random() * 256;
    const radius = 0.8 + random() * 2.4;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 1.8, radius, random() * Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = random() > 0.45 ? "rgba(45, 103, 43, 0.15)" : "rgba(184, 215, 145, 0.16)";
    ctx.fill();
  }

  grassTex = new THREE.CanvasTexture(canvas);
  grassTex.colorSpace = THREE.SRGBColorSpace;
  grassTex.wrapS = THREE.RepeatWrapping;
  grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(2.4, 1.9);
  grassTex.anisotropy = 4;
  return grassTex;
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

/** One roof cell. Activation is staggered so panels sweep across the roof. */
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
      {/* live panel: dark cell body + solar-cell texture on top */}
      <group ref={panel} position={[0, 0.04, 0]}>
        <mesh>
          <boxGeometry args={[w * 0.96, 0.05, d * 0.98]} />
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
          <planeGeometry args={[w * 0.96, d * 0.98]} />
        </mesh>
      </group>
    </group>
  );
}

/** The moving markers indicate direction, not a measured charging rate. */
function BatteryFlow({ width, depth, eaveHeight, tilt, reduceMotion }: { width: number; depth: number; eaveHeight: number; tilt: number; reduceMotion: boolean }) {
  const markers = useRef<Array<THREE.Group | null>>([]);
  const curve = useMemo(() => {
    const batteryX = width / 2 + 0.22;
    const batteryZ = depth / 2 - 0.08;
    const routeX = width / 2 + 0.38;
    const startZ = depth * 0.12;
    const startY = eaveHeight + Math.tan(tilt) * (depth / 2 - startZ) + 0.2;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(width * 0.05, startY, startZ),
      new THREE.Vector3(width * 0.34, startY + 0.01, startZ),
      new THREE.Vector3(routeX, startY + 0.04, startZ),
      new THREE.Vector3(routeX, eaveHeight + 0.18, batteryZ - 0.12),
      new THREE.Vector3(routeX, 1.24, batteryZ),
      new THREE.Vector3(batteryX, 1.16, batteryZ),
    ], false, "centripetal");
  }, [width, depth, eaveHeight, tilt]);
  const points = useMemo(() => curve.getPoints(56), [curve]);
  useFrame(({ clock }) => {
    markers.current.forEach((marker, i) => {
      if (marker) curve.getPointAt(reduceMotion ? (i + 1) / 5 : (clock.elapsedTime * 0.3 + i / 4) % 1, marker.position);
    });
  });
  return <group>
    <Line points={points} color="#29d6ff" lineWidth={6} transparent opacity={0.12} depthWrite={false} />
    <Line points={points} color="#29d6ff" lineWidth={2.2} transparent opacity={0.88} depthWrite={false} />
    {[0, 1, 2, 3].map((i) => <group key={i} ref={(marker) => { markers.current[i] = marker; }}>
      <mesh>
        <sphereGeometry args={[0.045, 14, 14]} />
        <meshBasicMaterial color="#d8faff" toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshBasicMaterial color="#29d6ff" transparent opacity={0.2} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>)}
  </group>;
}

/** One residential battery cabinet; cyan segments communicate package size. */
function Battery({ capacity, width, depth }: { capacity: number; width: number; depth: number }) {
  const activeSegments = Math.min(3, Math.ceil(capacity / 5));
  const boltShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.025, 0.22);
    shape.lineTo(-0.105, 0.015);
    shape.lineTo(-0.02, 0.015);
    shape.lineTo(-0.07, -0.22);
    shape.lineTo(0.12, 0.055);
    shape.lineTo(0.025, 0.055);
    shape.lineTo(0.095, 0.22);
    shape.closePath();
    return shape;
  }, []);
  return (
    <group position={[width / 2 + 0.22, 0.7, depth / 2 - 0.08]} rotation={[0, 0.24, 0]}>
      <pointLight position={[0.18, 0.08, 0.35]} color="#29d6ff" intensity={0.48} distance={1.25} decay={2} />

      {/* slim mounting shadow keeps the cabinet visually attached to the wall */}
      <RoundedBox args={[0.61, 0.94, 0.08]} radius={0.06} smoothness={4} position={[0, 0, -0.09]} castShadow>
        <meshStandardMaterial color="#253b45" roughness={0.72} metalness={0.12} />
      </RoundedBox>

      <RoundedBox args={[0.56, 0.9, 0.18]} radius={0.07} smoothness={5} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f4f7f4" roughness={0.38} metalness={0.08} clearcoat={0.55} clearcoatRoughness={0.25} />
        <Edges color="#8fa0a4" threshold={22} transparent opacity={0.62} />
      </RoundedBox>

      {/* inset face and the site's cyan energy signature */}
      <RoundedBox args={[0.42, 0.62, 0.012]} radius={0.045} smoothness={4} position={[0, 0.015, 0.097]}>
        <meshStandardMaterial color="#e4ece9" roughness={0.6} />
      </RoundedBox>
      <mesh position={[0.205, 0.08, 0.108]}>
        <boxGeometry args={[0.022, 0.48, 0.008]} />
        <meshBasicMaterial color="#29d6ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.015, 0.109]}>
        <circleGeometry args={[0.155, 32]} />
        <meshBasicMaterial color="#c9f5ff" transparent opacity={0.72} toneMapped={false} />
      </mesh>
      <mesh position={[-0.005, 0.015, 0.112]}>
        <shapeGeometry args={[boltShape]} />
        <meshBasicMaterial color="#12627a" toneMapped={false} />
      </mesh>

      {[-1, 0, 1].map((segment, index) => (
        <mesh key={segment} position={[segment * 0.075, -0.34, 0.109]}>
          <boxGeometry args={[0.052, 0.025, 0.007]} />
          <meshBasicMaterial
            color={index < activeSegments ? "#29d6ff" : "#8f9da0"}
            transparent
            opacity={index < activeSegments ? 1 : 0.35}
            toneMapped={false}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.49, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.08, 16]} />
        <meshStandardMaterial color="#314b55" roughness={0.55} metalness={0.25} />
      </mesh>
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

  // Only installed modules are laid out. Their portrait proportions remain
  // legible instead of shrinking to the roof's theoretical slot count.
  const cells = useMemo(() => {
    const visualCount = Math.max(1, lit);
    const rows = Math.max(1, Math.ceil(Math.sqrt(visualCount / 2.4)));
    const cols = Math.ceil(visualCount / rows);
    const usableWidth = roofW - 0.3;
    const usableDepth = (isFlat ? flatDepth : slope) - 0.22;
    const panelWidth = Math.max(0.22, Math.min(0.46, (usableWidth - (cols - 1) * 0.045) / cols));
    const panelDepth = Math.max(0.28, Math.min(0.72, (usableDepth - (rows - 1) * 0.045) / rows));
    const stepX = panelWidth + 0.045;
    const stepZ = panelDepth + 0.045;
    const centerRow = (rows - 1) / 2;

    const positions = Array.from({ length: rows }, (_, row) => {
      const rowCount = Math.min(cols, visualCount - row * cols);
      const centerCol = (rowCount - 1) / 2;
      return Array.from({ length: rowCount }, (_, col) => ({
        row,
        col,
        centerCol,
      })).sort((a, b) => Math.abs(a.col - a.centerCol) - Math.abs(b.col - b.centerCol) || a.col - b.col);
    }).flat();

    return positions.map(({ col, row, centerCol }, idx) => ({
        idx,
        x: (col - centerCol) * stepX,
        z: (row - centerRow) * stepZ,
        w: panelWidth,
        d: panelDepth,
        delay: idx * 0.035,
      }));
  }, [lit, roofW, slope, isFlat, flatDepth]);

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
          <Battery capacity={batteryKwh} width={WALL_W} depth={WALL_D} />
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

/** Instanced triangular blades keep the lawn dimensional without a heavy grass model. */
function GrassBlades() {
  const dark = useRef<THREE.InstancedMesh>(null!);
  const light = useRef<THREE.InstancedMesh>(null!);
  const matrices = useMemo(() => {
    const random = (index: number, salt: number) => {
      const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };
    const blades = Array.from({ length: 3600 }, (_, index) => ({
      index,
      x: (random(index, 1) - 0.5) * 4.9,
      z: (random(index, 2) - 0.5) * 3.7,
    }))
      .filter(({ x, z }) => !(Math.abs(x) < 1.72 && Math.abs(z) < 1.28))
      .slice(0, 1800);

    return [false, true].map((isLight) => blades
      .filter(({ index }) => (random(index, 3) > 0.7) === isLight)
      .map(({ index, x, z }) => new THREE.Matrix4().compose(
        new THREE.Vector3(x, 0, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(
          (random(index, 4) - 0.5) * 0.12,
          random(index, 5) * Math.PI,
          (random(index, 6) - 0.5) * 0.12,
        )),
        new THREE.Vector3(
          0.75 + random(index, 7) * 0.45,
          0.72 + random(index, 8) * 0.55,
          0.75 + random(index, 9) * 0.45,
        ),
      )));
  }, []);

  useLayoutEffect(() => {
    [dark.current, light.current].forEach((mesh, groupIndex) => {
      matrices[groupIndex].forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [matrices]);

  return (
    <group position={[0, 0.022, 0]}>
      <instancedMesh ref={dark} args={[undefined, undefined, matrices[0].length]}>
        <coneGeometry args={[0.009, 0.044, 3]} />
        <meshStandardMaterial color="#5b8d4d" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={light} args={[undefined, undefined, matrices[1].length]}>
        <coneGeometry args={[0.008, 0.038, 3]} />
        <meshStandardMaterial color="#8fb66d" roughness={1} />
      </instancedMesh>
    </group>
  );
}

/** Rounded lawn stage the diorama sits on. */
function Stage() {
  const grass = useMemo(
    () => new THREE.MeshStandardMaterial({ map: getGrassTexture(), roughness: 0.98, metalness: 0 }),
    [],
  );
  return <group>
    <RoundedBox
        args={[5.3, 0.22, 4.1]}
        radius={0.1}
        smoothness={6}
        position={[0, -0.11, 0]}
        material={grass}
        receiveShadow
      />
    <GrassBlades />
  </group>;
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
    <div className={styles.scene}>
      <Canvas
        aria-hidden="true"
        shadows
        dpr={[1, 2]}
        camera={{ position: [3.2, 5.8, 9.3], fov: 30 }}
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
