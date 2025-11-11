"use client"

import { memo, useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { useEditorStore } from "@/lib/store"
import {
  enhanceSplineMaterials,
  getMaterialDebugInfo,
  type MaterialPresetType,
} from "@/lib/spline-material-mapper"

interface SplineBeadMeshProps {
  splineUrl: string
  scale?: number
  isSelected?: boolean
}

/**
 * SplineBeadMesh - Renders GLB models exported from Spline
 * 
 * New simplified approach:
 * - Only supports GLB files (no .splinecode runtime)
 * - Preserves PBR materials and emissive properties from Spline
 * - Auto-scales and centers models
 * - Applies material presets from catalog configuration
 */
export const SplineBeadMesh = memo(function SplineBeadMesh({
  splineUrl,
  scale = 1,
  isSelected = false,
}: SplineBeadMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { beadCatalog } = useEditorStore()
  
  const beadData = useMemo(
    () => beadCatalog.find((b) => b.splineUrl === splineUrl),
    [beadCatalog, splineUrl]
  )

  // Load GLB with useGLTF hook
  const gltf = useGLTF(splineUrl)

  // Process and normalize the model
  const processedModel = useMemo(() => {
    if (!gltf?.scene) {
      return null
    }

    // Clone the scene to avoid modifying the cached version
    const clonedScene = gltf.scene.clone(true)

    // Determine material preset
    let materialPreset: MaterialPresetType = 'default'
    if (beadData?.materialConfig?.presetType) {
      materialPreset = beadData.materialConfig.presetType
    } else if (beadData?.material) {
      const materialMap: Record<string, MaterialPresetType> = {
        'glass': 'glass',
        'crystal': 'crystal',
        'acrylic': 'acrylic',
        'metal-gold': 'metal',
        'metal-silver': 'metal',
        'plastic': 'acrylic',
      }
      materialPreset = materialMap[beadData.material] || 'default'
    }

    console.log(`[Spline Bead] Applying material preset: ${materialPreset}`)

    // Apply material enhancements
    const customConfig = beadData?.materialConfig
    enhanceSplineMaterials(
      { scene: clonedScene },
      materialPreset,
      beadData?.baseColor,
      customConfig
    )

    // Log material info for debugging
    let materialCount = 0
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => {
          materialCount++
          const debugInfo = getMaterialDebugInfo(material)
          console.log(`[Spline Bead] Material ${materialCount}:`, debugInfo)
        })
      }
    })

    console.log(`[Spline Bead] Total materials enhanced: ${materialCount}`)

    // Calculate bounding box and auto-scale
    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    // Scale to fit within 0.4 units (same as other beads)
    const targetSize = 0.4
    const autoScale = maxDim > 0 ? targetSize / maxDim : 0.2

    // Center the model
    const center = box.getCenter(new THREE.Vector3())
    clonedScene.position.sub(center)

    console.log('[Spline Bead] Model normalized - scale:', autoScale, 'size:', size)

    return { scene: clonedScene, autoScale }
  }, [gltf, beadData])

  // Animate scale for hover and selection
  useFrame(() => {
    if (groupRef.current && processedModel) {
      const targetScale = (isSelected ? 1.15 : 1) * scale * processedModel.autoScale
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
    }
  })

  if (!processedModel) {
    // Loading fallback
    return (
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color="#63B3FF"
            transparent
            opacity={0.5}
            emissive="#63B3FF"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={groupRef}>
      <primitive object={processedModel.scene} />
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshBasicMaterial
            color="#FFD66D"
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </group>
  )
})

// Preload GLB models
useGLTF.preload('/models/flow_4.glb')
useGLTF.preload('/models/key.glb')
