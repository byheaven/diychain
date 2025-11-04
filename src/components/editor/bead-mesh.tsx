"use client"

import { useRef, useState, useMemo as reactUseMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useEditorStore } from "@/lib/store"
import type { BeadInChain } from "@/types"
import { createHeartShape, createStarShape } from "./bead-geometries"

interface BeadMeshProps {
  bead: BeadInChain
  position: THREE.Vector3
  index: number
}

export function BeadMesh({ bead, position, index }: BeadMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { selectedBeadIndex, selectBead, beadCatalog } = useEditorStore()

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
  useFrame((state) => {
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

  // Get geometry based on shape
  const getGeometry = () => {
    const shape = beadData?.shape || 'sphere'
    const size = 0.2

    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[size, 32, 32]} />

      case 'cube':
        return <boxGeometry args={[size * 1.8, size * 1.8, size * 1.8]} />

      case 'cylinder':
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

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={bead.rotation}
      onClick={() => selectBead(index)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
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
function useMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ value: T; deps: React.DependencyList }>()

  if (
    !ref.current ||
    !deps.every((dep, i) => Object.is(dep, ref.current!.deps[i]))
  ) {
    ref.current = { value: factory(), deps }
  }

  return ref.current.value
}
