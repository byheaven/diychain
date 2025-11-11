"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { Physics } from "@react-three/rapier"
import { Suspense } from "react"
import { HangingChain } from "./hanging-chain-v2"

export function Canvas3D() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-background via-background to-muted">
      <Canvas
        camera={{
          position: [0, 2, 8],  // Front view, looking at hanging necklace
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Environment lighting */}
        <Suspense fallback={null}>
          <Environment preset="apartment" environmentIntensity={0.8} />
        </Suspense>

        {/* Physics-driven hanging chain */}
        <Suspense fallback={<mesh><boxGeometry /><meshBasicMaterial color="red" /></mesh>}>
          <Physics gravity={[0, -9.81, 0]}>
            <HangingChain />
          </Physics>
        </Suspense>

        {/* Orbit Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={3}
          maxDistance={15}
          target={[0, 2, 0]}  // Focus on necklace center
        />

        {/* Post-processing Effects */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
            height={300}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
