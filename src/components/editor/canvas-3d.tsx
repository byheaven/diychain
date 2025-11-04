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
          position: [0, 2, 8],
          fov: 40,
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

        {/* Chain Editor */}
        <Suspense fallback={null}>
          <ChainEditor />
        </Suspense>

        {/* Contact Shadows */}
        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />

        {/* Orbit Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={15}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}
