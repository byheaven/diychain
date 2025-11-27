"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useGLTF } from "@react-three/drei"
import {
  enhanceSplineMaterials,
  type MaterialPresetType,
} from "@/lib/spline-material-mapper"
import type { AdvancedMaterialConfig } from "@/types"

interface InstancedBeadProps {
  glbUrl: string
  positions: THREE.Vector3[]
  rotations: THREE.Euler[]
  scales: number[]
  materialPreset?: MaterialPresetType
  baseColor?: string
  materialConfig?: AdvancedMaterialConfig
}

/**
 * InstancedBead - Renders multiple copies of the same GLB model using instancing
 * 
 * Performance optimization for rendering many identical beads on a chain.
 * Uses Three.js InstancedMesh for efficient GPU rendering.
 */
export function InstancedBead({
  glbUrl,
  positions,
  rotations,
  scales,
  materialPreset = 'default',
  baseColor,
  materialConfig,
}: InstancedBeadProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const gltf = useGLTF(glbUrl)

  // Extract geometry and material from GLB
  const { geometry, materials } = useMemo(() => {
    if (!gltf?.scene) {
      return { geometry: null, materials: [] }
    }

    let foundGeometry: THREE.BufferGeometry | null = null
    const foundMaterials: THREE.Material[] = []

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (!foundGeometry) {
          foundGeometry = child.geometry
        }
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        foundMaterials.push(...mats)
      }
    })

    // Apply material enhancements
    if (foundMaterials.length > 0) {
      enhanceSplineMaterials(
        { scene: gltf.scene },
        materialPreset,
        baseColor,
        materialConfig
      )
    }

    return { geometry: foundGeometry, materials: foundMaterials }
  }, [gltf, materialPreset, baseColor, materialConfig])

  // Update instance matrices
  useEffect(() => {
    if (!instancedMeshRef.current || positions.length === 0) {
      return
    }

    const tempObject = new THREE.Object3D()
    const mesh = instancedMeshRef.current

    positions.forEach((position, i) => {
      tempObject.position.copy(position)
      tempObject.rotation.copy(rotations[i] || new THREE.Euler())
      tempObject.scale.setScalar(scales[i] || 1)
      tempObject.updateMatrix()
      
      mesh.setMatrixAt(i, tempObject.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  }, [positions, rotations, scales])

  // Animate instances (optional - for subtle movement)
  useFrame((state) => {
    if (!instancedMeshRef.current) return
    
    // Subtle floating animation
    const time = state.clock.elapsedTime
    instancedMeshRef.current.rotation.y = Math.sin(time * 0.2) * 0.05
  })

  if (!geometry || materials.length === 0) {
    return null
  }

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[geometry, materials[0], positions.length]}
    />
  )
}

