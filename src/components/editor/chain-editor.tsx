"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useEditorStore } from "@/lib/store"
import { BeadMesh } from "./bead-mesh"

export function ChainEditor() {
  const chainRef = useRef<THREE.Group>(null)
  const { chainStructure } = useEditorStore()

  // Generate slot positions along a curve
  const slotPositions = useMemo(() => {
    const { chainMeta } = chainStructure
    const positions: THREE.Vector3[] = []
    const totalSlots = chainMeta.maxBeads
    const spacing = chainMeta.slotSpacing / 10 // Convert to Three.js units

    // Create a simple catenary curve for natural chain drape
    for (let i = 0; i < totalSlots; i++) {
      const t = (i / (totalSlots - 1)) * 2 - 1 // -1 to 1
      const x = t * 3 // Spread horizontally
      const y = -Math.pow(t, 2) * 0.5 // Catenary curve (parabola approximation)
      const z = 0

      positions.push(new THREE.Vector3(x, y, z))
    }

    return positions
  }, [chainStructure.chainMeta])

  // Gentle rotation animation
  useFrame((state) => {
    if (chainRef.current && chainStructure.beads.length === 0) {
      chainRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group ref={chainRef}>
      {/* Chain wire/string */}
      <ChainWire positions={slotPositions} />

      {/* Slot indicators (visible when empty) */}
      {chainStructure.beads.length === 0 && (
        <SlotIndicators positions={slotPositions} />
      )}

      {/* Beads */}
      {chainStructure.beads.map((bead, index) => {
        const position = slotPositions[bead.positionIndex] || slotPositions[index]
        return (
          <BeadMesh
            key={`${bead.catalogId}-${bead.positionIndex}`}
            bead={bead}
            position={position}
            index={bead.positionIndex}
          />
        )
      })}
    </group>
  )
}

function ChainWire({ positions }: { positions: THREE.Vector3[] }) {
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(positions)
    return curve.getPoints(200)
  }, [positions])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#888888" linewidth={2} />
    </line>
  )
}

function SlotIndicators({ positions }: { positions: THREE.Vector3[] }) {
  return (
    <>
      {positions.slice(0, 10).map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color="#63B3FF"
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </>
  )
}
