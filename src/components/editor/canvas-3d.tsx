"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { Suspense } from "react"
import { ChainEditor } from "./chain-editor"

export function Canvas3D() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-background via-background to-muted">
      <Canvas
        camera={{
          position: [0, 6, 5],  // 调整为俯视角度，从上方往下看
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-5, 3, -5]}
          intensity={0.3}
        />

        {/* Environment */}
        <Suspense fallback={null}>
          <Environment preset="studio" />
        </Suspense>

        {/* Desktop surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial
            color="#f8f9fa"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Chain Editor */}
        <Suspense fallback={null}>
          <ChainEditor />
        </Suspense>

        {/* Contact Shadows */}
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.25}
          scale={10}
          blur={2.5}
          far={4}
          resolution={512}
          frames={1}  // Only render once to prevent flickering
        />

        {/* Orbit Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={3}
          maxDistance={15}
          minPolarAngle={0}              // 允许从正上方看
          maxPolarAngle={Math.PI / 2}    // 最低可以平视
          target={[0, 0, 0]}             // 聚焦在桌面中心
        />
      </Canvas>
    </div>
  )
}
