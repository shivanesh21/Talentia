import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text, MeshTransmissionMaterial, ContactShadows } from "@react-three/drei";

const LETTERS = "TALENTIA".split("");

function LetterRing({ mouse }) {
  const group = useRef();
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.35;
    group.current.rotation.x += ((mouse.current.y * 0.35) - group.current.rotation.x) * 0.05;
    group.current.rotation.z = mouse.current.x * 0.15;
  });
  return (
    <group ref={group}>
      {LETTERS.map((ch, i) => {
        const angle = (i / LETTERS.length) * Math.PI * 2;
        const x = Math.cos(angle) * 1.9;
        const z = Math.sin(angle) * 1.9;
        return (
          <Float key={i} speed={2} floatIntensity={0.6}>
            <Text
              position={[x, 0, z]}
              rotation={[0, -angle + Math.PI / 2, 0]}
              fontSize={0.55}
              color="#e8fbff"
              anchorX="center"
              anchorY="middle"
            >
              {ch}
            </Text>
          </Float>
        );
      })}
    </group>
  );
}

function Core({ mouse }) {
  const core = useRef();
  const ring = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y = t * 0.25;
      core.current.rotation.x = Math.sin(t * 0.3) * 0.2 + mouse.current.y * 0.3;
      core.current.position.x = mouse.current.x * 0.4;
      core.current.position.y = -mouse.current.y * 0.4;
    }
    if (ring.current) ring.current.rotation.z = t * 0.3;
  });
  return (
    <group>
      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.9}>
        <mesh ref={core}>
          <icosahedronGeometry args={[1.05, 1]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={1.4}
            roughness={0.15}
            chromaticAberration={0.06}
            anisotropicBlur={0.3}
            distortion={0.4}
            distortionScale={0.4}
            color="#9be9ff"
          />
        </mesh>
      </Float>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.35, 0.035, 16, 120]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.6} transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, 0.4, 0]}>
        <torusGeometry args={[2.7, 0.02, 16, 120]} />
        <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={1.2} transparent opacity={0.5} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={12} color="#67e8f9" distance={8} />
    </group>
  );
}

export default function HeroObject() {
  const mouse = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  return (
    <div
      className="relative h-[340px] w-full sm:h-[420px] lg:h-[520px]"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mouse.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        mouse.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      }}
    >
      <Canvas camera={{ position: [0, 0.4, 7.5], fov: 45 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }} onCreated={() => setReady(true)}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 5, 5]} intensity={1.4} />
        <pointLight position={[-6, 3, 4]} intensity={25} color="#a78bfa" />
        <Core mouse={mouse} />
        <LetterRing mouse={mouse} />
        <ContactShadows position={[0, -3, 0]} opacity={0.55} scale={10} blur={2.4} far={4} color="#000" />
      </Canvas>
      {!ready && <div className="absolute inset-0 animate-pulse rounded-3xl bg-white/5" />}
    </div>
  );
}
