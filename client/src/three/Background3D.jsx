import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function ParticleField({ count = 350 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 24 - 6;
    }
    return arr;
  }, [count]);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.4;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#67e8f9" transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Shapes() {
  const g1 = useRef();
  const g2 = useRef();
  const g3 = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (g1.current) { g1.current.rotation.x = t * 0.15; g1.current.rotation.y = t * 0.2; }
    if (g2.current) { g2.current.rotation.z = t * 0.1; g2.current.position.y = Math.sin(t * 0.5) * 0.5; }
    if (g3.current) { g3.current.rotation.y = -t * 0.12; }
  });
  return (
    <group>
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
        <mesh ref={g1} position={[-7, 2, -6]}>
          <icosahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial color="#0e7490" wireframe transparent opacity={0.5} />
        </mesh>
      </Float>
      <Float speed={1.1} rotationIntensity={0.4} floatIntensity={1}>
        <mesh ref={g2} position={[7.5, -1, -7]}>
          <torusGeometry args={[1.2, 0.28, 16, 48]} />
          <meshStandardMaterial color="#7c3aed" transparent opacity={0.35} roughness={0.2} metalness={0.8} />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={0.8} floatIntensity={1.4}>
        <mesh ref={g3} position={[6, 3.4, -9]}>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color="#155e75" wireframe transparent opacity={0.45} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[-6.5, -2.5, -8]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color="#ec4899" transparent opacity={0.28} roughness={0.1} metalness={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <div className="absolute inset-0 grid-overlay" />
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[8, 6, 4]} intensity={30} color="#22d3ee" />
        <pointLight position={[-8, -4, 2]} intensity={20} color="#a78bfa" />
        <Stars radius={60} depth={30} count={1800} factor={3} saturation={0} fade speed={0.6} />
        <ParticleField />
        <Shapes />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060709]" />
    </div>
  );
}
