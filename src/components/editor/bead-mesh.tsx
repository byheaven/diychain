"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useEditorStore } from "@/lib/store"
import type { BeadInChain } from "@/types"

interface BeadMeshProps {
  bead: BeadInChain
  position: THREE.Vector3
  index: number
}

export function BeadMesh({ bead, position, index }: BeadMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { selectedBeadIndex, selectBead } = useEditorStore()

  const isSelected = selectedBeadIndex === index

  // Create material based on bead properties
  const material = useMemo(() => {
    const baseProps = {
      metalness: bead.metalness ?? 0.2,
      roughness: bead.roughness ?? 0.4,
      color: bead.colorVariant || bead.customTint || "#FF6DAF",
    }

    return new THREE.MeshStandardMaterial({
      ...baseProps,
      transparent: baseProps.roughness < 0.2,
      opacity: baseProps.roughness < 0.2 ? 0.8 : 1,
    })
  }, [bead])

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
      <sphereGeometry args={[0.2, 32, 32]} />
      <primitive object={material} attach="material" />

      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.25, 32, 32]} />
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
