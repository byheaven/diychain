"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useEditorStore } from "@/lib/store"
import { BeadMesh } from "./bead-mesh"

export function ChainEditor() {
  const chainRef = useRef<THREE.Group>(null)
  const { chainStructure } = useEditorStore()

  // Generate slot positions along a circular necklace shape
  const slotPositions = useMemo(() => {
    const beadCount = chainStructure.beads.length
    const positions: THREE.Vector3[] = []

    // If no beads, create preview slots
    const totalSlots = beadCount > 0 ? beadCount : 16

    // Necklace dimensions - elliptical shape
    const radiusX = 2.0 // Horizontal radius
    const radiusY = 2.5 // Vertical radius (taller to look like a necklace)
    const offsetY = 0.3 // Offset upward slightly

    // Create a circular/elliptical necklace shape
    for (let i = 0; i < totalSlots; i++) {
      // Angle around the circle (0 to 2π)
      const angle = (i / totalSlots) * Math.PI * 2

      // Position on ellipse
      const x = Math.cos(angle) * radiusX
      const y = Math.sin(angle) * radiusY - offsetY // Offset downward for necklace look
      const z = 0

      positions.push(new THREE.Vector3(x, y, z))
    }

    return positions
  }, [chainStructure.beads.length])

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
      {chainStructure.beads.map((bead, arrayIndex) => {
        // Use array index for positioning to ensure proper spacing
        const position = slotPositions[arrayIndex] || new THREE.Vector3(0, 0, 0)
        return (
          <BeadMesh
            key={`${bead.catalogId}-${bead.positionIndex}-${arrayIndex}`}
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
    // Create a closed curve for necklace
    const curve = new THREE.CatmullRomCurve3(positions, true) // true = closed curve
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
      {positions.map((pos, i) => (
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
