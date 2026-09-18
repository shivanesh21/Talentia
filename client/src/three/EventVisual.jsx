import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";

/**
 * Lightweight per-card 3D visual. `kind` selects the motif.
 * Kept low-poly + dpr-capped for mobile performance.
 */
function Motif({ kind, accent }) {
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.8;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.25;
    }
  });
  const mat = { color: accent, emissive: accent, emissiveIntensity: 0.9 };
  return (
    <group ref={ref}>
      {kind === "binary" && (
        <group>
          <mesh><boxGeometry args={[1.5, 1.5, 0.15]} /><meshStandardMaterial color="#0b1220" transparent opacity={0.9} /></mesh>
          <Text position={[-0.35, 0.3, 0.15]} fontSize={0.42} color={accent}>01</Text>
          <Text position={[0.35, -0.3, 0.15]} fontSize={0.42} color="#ffffff">10</Text>
          <mesh position={[0, 0, -0.35]}><torusGeometry args={[1.25, 0.03, 12, 48]} /><meshStandardMaterial {...mat} transparent opacity={0.7} /></mesh>
        </group>
      )}
      {kind === "data" && (
        <group>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <mesh key={`${r}${c}`} position={[(c - 1) * 0.55, (1 - r) * 0.55, 0]}>
                <boxGeometry args={[0.48, 0.48, 0.12]} />
                <meshStandardMaterial color={r === 1 && c === 1 ? accent : "#101828"} emissive={r === 1 && c === 1 ? accent : "#000"} emissiveIntensity={r === 1 && c === 1 ? 1 : 0} transparent opacity={0.95} />
              </mesh>
            ))
          )}
          <mesh position={[0.9, 0.9, 0.3]}><torusGeometry args={[0.4, 0.06, 12, 32]} /><meshStandardMaterial {...mat} /></mesh>
          <mesh position={[1.15, 1.15, 0.3]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.5, 0.08, 0.08]} /><meshStandardMaterial {...mat} /></mesh>
        </group>
      )}
      {kind === "arena" && (
        <group>
          <mesh><torusGeometry args={[0.85, 0.16, 16, 40]} /><meshStandardMaterial {...mat} /></mesh>
          <Text position={[0, 0.05, 0.3]} fontSize={0.7} color="#fff" anchorX="center" anchorY="middle">?</Text>
          {[...Array(8)].map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 1.3, Math.sin(a) * 1.3, 0]} rotation={[0, 0, a]}>
                <boxGeometry args={[0.22, 0.08, 0.08]} /><meshStandardMaterial {...mat} transparent opacity={0.9} />
              </mesh>
            );
          })}
        </group>
      )}
      {kind === "flip" && (
        <group>
          <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.28, 0.34, 1.3, 24]} />
            <meshStandardMaterial color="#0ea5e9" transparent opacity={0.75} roughness={0.15} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.95, 0]} rotation={[0, 0, 0.5]}><cylinderGeometry args={[0.1, 0.1, 0.25, 16]} /><meshStandardMaterial {...mat} /></mesh>
          <mesh position={[0, -1, 0]} rotation={[0, 0, 0]}><boxGeometry args={[2, 0.12, 0.6]} /><meshStandardMaterial color="#1f2937" /></mesh>
        </group>
      )}
      {kind === "meme" && (
        <group>
          <mesh position={[-0.45, 0.2, 0]}><boxGeometry args={[1, 1.1, 0.1]} /><meshStandardMaterial color="#111827" /></mesh>
          <Text position={[-0.45, 0.45, 0.1]} fontSize={0.22} color={accent}>lol 😄</Text>
          <Text position={[-0.45, 0.05, 0.1]} fontSize={0.16} color="#fff">EN → TA?</Text>
          <mesh position={[0.75, -0.3, 0]}><sphereGeometry args={[0.42, 24, 24]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} /></mesh>
          <Text position={[0.75, -0.28, 0.45]} fontSize={0.3} color="#111">😎</Text>
        </group>
      )}
      {kind === "gift" && (
        <group>
          <mesh position={[0, -0.25, 0]}><boxGeometry args={[1.1, 0.9, 1.1]} /><meshStandardMaterial color="#7c2d12" roughness={0.4} /></mesh>
          <mesh position={[0, 0.28, 0]}><boxGeometry args={[1.25, 0.22, 1.25]} /><meshStandardMaterial {...mat} /></mesh>
          <mesh position={[0, -0.2, 0]}><boxGeometry args={[0.22, 1.1, 1.12]} /><meshStandardMaterial color="#fff7ed" emissive={accent} emissiveIntensity={0.25} /></mesh>
          <Text position={[0, 1, 0]} fontSize={0.5} color={accent}>?</Text>
        </group>
      )}
    </group>
  );
}

export default function EventVisual({ kind, accent }) {
  return (
    <div className="h-44 w-full">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1} />
        <pointLight position={[3, 3, 3]} intensity={18} color={accent} />
        <pointLight position={[-3, -2, 2]} intensity={10} color="#ffffff" />
        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.9}>
          <Motif kind={kind} accent={accent} />
        </Float>
      </Canvas>
    </div>
  );
}
