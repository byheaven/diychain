"use client"

import { useRef, useState, useMemo as reactUseMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useEditorStore } from "@/lib/store"
import type { BeadInChain } from "@/types"
import { createHeartShape, createStarShape } from "./bead-geometries"
import { SplineBeadMesh } from "./spline-bead-mesh"

interface BeadMeshProps {
  bead: BeadInChain
  position: THREE.Vector3
  index: number
  outwardAngle?: number  // Angle to face outward from center (radians)
  tangent?: THREE.Vector3  // Curve tangent for orientation
}

export function BeadMesh({ bead, position, index, outwardAngle = 0, tangent }: BeadMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { selectedBeadIndex, selectBead, beadCatalog, chainHeight } = useEditorStore()

  const isSelected = selectedBeadIndex === index

  // Get the actual bead data from catalog
  const beadData = beadCatalog.find((b) => b.id === bead.catalogId)

  // Create material based on bead properties
  const material = useMemo(() => {
    // Use customTint if set, otherwise use catalog color
    const color = bead.customTint || bead.colorVariant || beadData?.baseColor || "#FF6DAF"

    const baseProps = {
      metalness: bead.metalness ?? 0.2,
      roughness: bead.roughness ?? 0.4,
      color,
    }

    return new THREE.MeshStandardMaterial({
      ...baseProps,
      transparent: baseProps.roughness < 0.2,
      opacity: baseProps.roughness < 0.2 ? 0.8 : 1,
    })
  }, [bead, beadData])

  // Hover and selection effects
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = (hovered ? 1.1 : 1) * (isSelected ? 1.15 : 1) * bead.scale
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
    }
  })

  // Create custom geometries
  const heartGeometry = reactUseMemo(() => createHeartShape(), [])
  const starGeometry = reactUseMemo(() => createStarShape(), [])

  // Get geometry based on shape (adjusted for laying flat on desktop)
  const getGeometry = () => {
    const shape = beadData?.shape || 'sphere'
    const size = 0.2

    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[size, 32, 32]} />

      case 'cube':
        return <boxGeometry args={[size * 1.8, size * 1.8, size * 1.8]} />

      case 'cylinder':
        // Cylinder should lay flat (rotate 90 degrees on X axis)
        return <cylinderGeometry args={[size * 0.8, size * 0.8, size * 1.5, 32]} />

      case 'heart':
        return <primitive object={heartGeometry} />

      case 'star':
        return <primitive object={starGeometry} />

      case 'flower':
        // Flower shape using icosahedron
        return <icosahedronGeometry args={[size, 1]} />

      default:
        return <sphereGeometry args={[size, 32, 32]} />
    }
  }

  // Get rotation for beads laying flat on desktop
  const getBeadRotation = (): [number, number, number] => {
    const shape = beadData?.shape || 'sphere'
    const baseRotation = bead.rotation || [0, 0, 0]

    switch (shape) {
      case 'cylinder':
        // Rotate cylinder to lay flat
        return [Math.PI / 2, baseRotation[1], baseRotation[2]]

      case 'heart':
      case 'star':
        // Heart/star should lay flat on desktop
        // Heart shape: XY plane with tip at -Y
        // After X rotation by π/2: tip points to -Z (inward)
        // Add π to flip 180° so tip points outward
        return [Math.PI / 2, baseRotation[1], -outwardAngle + Math.PI]

      default:
        // Sphere, cube, flower don't need rotation adjustment
        return baseRotation as [number, number, number]
    }
  }

  const getSelectionGeometry = () => {
    const shape = beadData?.shape || 'sphere'
    const size = 0.25

    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[size, 32, 32]} />
      case 'cube':
        return <boxGeometry args={[size * 1.8, size * 1.8, size * 1.8]} />
      case 'cylinder':
        return <cylinderGeometry args={[size * 0.8, size * 0.8, size * 1.5, 32]} />
      case 'heart':
      case 'star':
        return <octahedronGeometry args={[size * 1.2, 0]} />
      case 'flower':
        return <icosahedronGeometry args={[size, 1]} />
      default:
        return <sphereGeometry args={[size, 32, 32]} />
    }
  }

  // Position bead so its center is at chain height (chain passes through center)
  const getBeadPosition = (): [number, number, number] => {
    // All beads' centers should be at chainHeight so the chain passes through them
    // The XZ position comes from the chain curve
    return [position.x, chainHeight, position.z]
  }

  // Special handling for Spline beads
  if (beadData?.shape === 'spline' && beadData?.splineUrl) {
    return (
      <group position={getBeadPosition()} onClick={() => selectBead(index)}>
        <SplineBeadMesh
          splineUrl={beadData.splineUrl}
          scale={bead.scale}
          isSelected={isSelected}
        />
      </group>
    )
  }

  return (
    <mesh
      ref={meshRef}
      position={getBeadPosition()}
      rotation={getBeadRotation()}
      onClick={() => selectBead(index)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getGeometry()}
      <primitive object={material} attach="material" />

      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          {getSelectionGeometry()}
          <meshBasicMaterial
            color="#FFD66D"
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </mesh>
  )
}

// Move useMemo to top level
function useMemo<T>(factory: () => T, deps: React.DependencyList = []): T {
  const ref = useRef<{ value: T; deps: React.DependencyList } | undefined>(undefined)

  if (
    !ref.current ||
    !deps.every((dep, i) => Object.is(dep, ref.current!.deps[i]))
  ) {
    ref.current = { value: factory(), deps }
  }

  return ref.current.value
}
