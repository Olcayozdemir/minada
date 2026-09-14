"use client";

/** Architectural details use local geometry; no remote textures or model downloads. */
type Vector = [number, number, number];

function Block({ at, size, color, roughness = 0.8 }: { at: Vector; size: Vector; color: string; roughness?: number }) {
  return <mesh position={at} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={roughness} /></mesh>;
}

function Glazing({ at, width, height, rotation = 0 }: { at: Vector; width: number; height: number; rotation?: number }) {
  return (
    <group position={at} rotation={[0, rotation, 0]}>
      <Block at={[0, 0, 0]} size={[width + 0.09, height + 0.09, 0.06]} color="#cbc9c2" />
      <Block at={[0, 0, 0.036]} size={[width, height, 0.025]} color="#18282e" />
      {[0, 1, 2].map((i) => (
        <group key={i} position={[(i - 1) * width / 3, 0, 0.06]}>
          <mesh>
            <planeGeometry args={[width / 3 - 0.024, height - 0.025]} />
            <meshPhysicalMaterial color={i === 1 ? "#677f80" : "#415a61"} metalness={0.4} roughness={0.12} clearcoat={1} />
          </mesh>
          {/* A soft reflected sky band gives the glazing depth without a fake room. */}
          <mesh position={[0.025, 0.08, 0.002]}>
            <planeGeometry args={[width / 3 * 0.34, height * 0.74]} />
            <meshBasicMaterial color="#dce8e7" transparent opacity={0.12} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Block at={[side * width / 2, 0, 0.07]} size={[0.026, height + 0.025, 0.045]} color="#303938" />
          <Block at={[0, side * height / 2, 0.07]} size={[width, 0.027, 0.045]} color="#303938" />
          <Block at={[side * width / 6, 0, 0.075]} size={[0.02, height, 0.04]} color="#303938" />
        </group>
      ))}
      <Block at={[0, -height / 2 - 0.035, 0.08]} size={[width + 0.15, 0.035, 0.19]} color="#eeece4" />
    </group>
  );
}

function OliveTree({ at, scale = 1 }: { at: Vector; scale?: number }) {
  return (
    <group position={at} scale={scale}>
      <mesh position={[0, 0.37, 0]} castShadow>
        <cylinderGeometry args={[0.023, 0.05, 0.74, 8]} />
        <meshStandardMaterial color="#706454" roughness={1} />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => {
        const angle = i * 2.39996;
        const radius = i < 9 ? 0.19 : 0.1;
        return <mesh key={i} position={[Math.cos(angle) * radius, 0.76 + Math.sin(i * 1.7) * 0.17, Math.sin(angle) * radius]} scale={[1, 1.3, 0.9]} castShadow>
          <icosahedronGeometry args={[0.18, 1]} />
          <meshStandardMaterial color={["#77805a", "#8d956a", "#616f4e", "#a0a77a"][i % 4]} roughness={1} />
        </mesh>;
      })}
      <mesh position={[0, 0.018, 0]} receiveShadow><cylinderGeometry args={[0.31, 0.32, 0.035, 32]} /><meshStandardMaterial color="#a3a28d" /></mesh>
    </group>
  );
}

export function SolarVillaDetails({ width, depth, height, upperFloor = false }: { width: number; depth: number; height: number; upperFloor?: boolean }) {
  const front = depth / 2;
  const doorX = -width / 2 + 0.46;
  const compact = width < 2.65;
  const wide = width >= 3.25;
  const windowX = compact ? 0.42 : 0.38;
  const windowWidth = compact ? 0.82 : 1.12;
  return (
    <group>
      <Block at={[0, 0.045, front + 0.32]} size={[width + 0.15, 0.09, 0.72]} color="#cfcbc0" />
      <Block at={[doorX, 0.018, front + 0.79]} size={[0.7, 0.035, 0.26]} color="#bdbbb1" />
      {Array.from({ length: Math.floor(width / 0.2) }, (_, i) => <Block key={i} at={[-width / 2 + 0.1 + i * 0.2, 0.093, front + 0.32]} size={[0.008, 0.006, 0.68]} color="#b1aa9a" />)}
      <Block at={[doorX, height * 0.46, front + 0.018]} size={[0.74, height * 0.92, 0.065]} color="#7e6249" />
      {Array.from({ length: 14 }, (_, i) => <Block key={i} at={[doorX - 0.35 + i * 0.054, height * 0.46, front + 0.059]} size={[0.031, height * 0.92, 0.027]} color={i % 3 ? "#a08666" : "#917656"} />)}
      <Block at={[doorX, 0.57, front + 0.085]} size={[0.41, 0.94, 0.045]} color="#313c3d" />
      <Block at={[doorX + 0.14, 0.59, front + 0.12]} size={[0.013, 0.22, 0.025]} color="#b8afa0" />
      <Block at={[doorX, 1.14, front + 0.2]} size={[0.66, 0.045, 0.42]} color="#3c4545" />
      <Glazing at={[windowX, 0.62, front + 0.027]} width={windowWidth} height={1.0} />
      {wide && <Glazing at={[1.4, 0.62, front + 0.027]} width={0.48} height={1.0} />}
      {/* Rear side window leaves a solid front service wall for battery modules. */}
      <Glazing at={[width / 2 + 0.026, 0.7, -depth / 2 + 0.4]} rotation={Math.PI / 2} width={0.6} height={0.7} />
      <Glazing at={[-width / 2 - 0.026, 0.65, 0]} rotation={-Math.PI / 2} width={0.9} height={0.8} />
      <Glazing at={[0.25, 0.65, -front - 0.026]} rotation={Math.PI} width={1.1} height={0.9} />
      {upperFloor && (
        <group>
          <Block at={[0, height + 0.025, 0]} size={[width + 0.1, 0.09, depth + 0.1]} color="#c9c9c0" />
          <Glazing at={[doorX, height + 0.53, front + 0.027]} width={0.72} height={0.7} />
          <Glazing at={[windowX, height + 0.53, front + 0.027]} width={windowWidth} height={0.7} />
          {wide && <Glazing at={[1.4, height + 0.53, front + 0.027]} width={0.48} height={0.7} />}
          {[-0.58, 0.58].map((z) => <Glazing key={z} at={[width / 2 + 0.026, height + 0.53, z]} rotation={Math.PI / 2} width={0.82} height={0.7} />)}
          <Glazing at={[-width / 2 - 0.026, height + 0.53, 0]} rotation={-Math.PI / 2} width={1.1} height={0.7} />
          <Glazing at={[0.25, height + 0.53, -front - 0.026]} rotation={Math.PI} width={1.1} height={0.7} />
          <Block at={[windowX, height + 0.1, front + 0.22]} size={[1.28, 0.055, 0.5]} color="#d9d7cd" />
          <Block at={[windowX, height + 0.44, front + 0.45]} size={[1.28, 0.025, 0.025]} color="#414c4b" />
          {Array.from({ length: 10 }, (_, i) => <Block key={i} at={[windowX - 0.6 + i * 0.133, height + 0.28, front + 0.45]} size={[0.012, 0.32, 0.012]} color="#56605b" />)}
        </group>
      )}
      <Block at={[0, 0.065, 0]} size={[width + 0.04, 0.1, depth + 0.04]} color="#b5b7b1" />
      <Block at={[0, height - 0.035, front + 0.015]} size={[width + 0.03, 0.06, 0.075]} color="#d5d3c9" />
      <mesh position={[width / 2 - 0.055, (height + (upperFloor ? 1.05 : 0)) / 2, front + 0.065]} castShadow><cylinderGeometry args={[0.024, 0.024, height + (upperFloor ? 1.05 : 0), 12]} /><meshStandardMaterial color="#4e5857" roughness={0.5} metalness={0.3} /></mesh>
      {!compact && <group>
        <Block at={[windowX, 0.27, front + 0.5]} size={[0.86, 0.065, 0.28]} color="#a48763" />
        {[-0.32, 0.32].map((x) => <Block key={x} at={[windowX + x, 0.17, front + 0.5]} size={[0.045, 0.2, 0.22]} color="#48504a" />)}
      </group>}
      <OliveTree at={[-width / 2 - 0.38, 0, -0.56]} scale={0.9} />
      <OliveTree at={[width / 2 + 0.42, 0, -depth / 2 - 0.1]} scale={0.7} />
    </group>
  );
}
