"use client"

import { useRef, useMemo } from "react"
import * as THREE from "three"
import { useEditorStore } from "@/lib/store"
import { BeadMesh } from "./bead-mesh"
import { DraggableControlPoint } from "./draggable-control-point"

export function ChainEditor() {
  const chainRef = useRef<THREE.Group>(null)
  const {
    chainStructure,
    chainControlPoints,
    isChainEditMode,
    updateControlPoint,
    chainHeight
  } = useEditorStore()

  // Generate slot positions and rotations from control points
  const slotData = useMemo(() => {
    const beadCount = chainStructure.beads.length
    const positions: THREE.Vector3[] = []
    const rotations: number[] = [] // Angle in radians (rotation around Y axis)

    // If no beads, create preview slots
    const totalSlots = beadCount > 0 ? beadCount : 16

    // Use control points to create a curve
    const curve = new THREE.CatmullRomCurve3(chainControlPoints, true)

    // Sample positions along the curve
    for (let i = 0; i < totalSlots; i++) {
      const t = i / totalSlots
      const point = curve.getPointAt(t)
      positions.push(point)

      // Calculate rotation to face outward from center
      // In XZ plane, the outward direction is from (0,0,0) to (x,z)
      const angle = Math.atan2(point.x, point.z) // Angle in XZ plane
      rotations.push(angle)
    }

    return { positions, rotations }
  }, [chainStructure.beads.length, chainControlPoints])

  // 禁用旋转动画（链条平放在桌面上）
  // useFrame((state) => {
  //   if (chainRef.current && chainStructure.beads.length === 0) {
  //     chainRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
  //   }
  // })

  return (
    <group ref={chainRef}>
      {/* Chain wire/string */}
      <ChainWire positions={chainControlPoints} />

      {/* Draggable control points (visible in edit mode) */}
      {chainControlPoints.map((point, index) => (
        <DraggableControlPoint
          key={index}
          position={point}
          index={index}
          onDrag={updateControlPoint}
          isEditing={isChainEditMode}
        />
      ))}

      {/* Slot indicators (visible when empty) */}
      {chainStructure.beads.length === 0 && !isChainEditMode && (
        <SlotIndicators positions={slotData.positions} chainHeight={chainHeight} />
      )}

      {/* Beads */}
      {chainStructure.beads.map((bead, arrayIndex) => {
        // Use array index for positioning to ensure proper spacing
        const position = slotData.positions[arrayIndex] || new THREE.Vector3(0, 0, 0)
        const outwardAngle = slotData.rotations[arrayIndex] || 0
        return (
          <BeadMesh
            key={`${bead.catalogId}-${bead.positionIndex}-${arrayIndex}`}
            bead={bead}
            position={position}
            index={bead.positionIndex}
            outwardAngle={outwardAngle}
          />
        )
      })}
    </group>
  )
}

// Create an oval curve for each link
function createOvalLinkCurve() {
  const points = []
  const linkLength = 0.08  // Length of the oval
  const linkWidth = 0.04   // Width of the oval

  // Create oval shape
  for (let i = 0; i <= 32; i++) {
    const t = (i / 32) * Math.PI * 2
    const x = Math.cos(t) * linkLength
    const y = Math.sin(t) * linkWidth
    points.push(new THREE.Vector3(x, y, 0))
  }

  return new THREE.CatmullRomCurve3(points, true)
}

function ChainWire({ positions }: { positions: THREE.Vector3[] }) {
  const { chainStructure } = useEditorStore()
  const chainStyle = chainStructure.chainMeta.chainStyle || 'simple'

  const curve = useMemo(() => {
    // Create a closed curve for necklace
    return new THREE.CatmullRomCurve3(positions, true) // true = closed curve
  }, [positions])

  // Pre-compute oval link curve for link style
  const ovalLinkCurve = useMemo(() => createOvalLinkCurve(), [])

  // Render different chain styles
  switch (chainStyle) {
    case 'simple':
      return (
        <mesh>
          <tubeGeometry args={[curve, 200, 0.02, 8, true]} />
          <meshStandardMaterial
            color="#C0C0C0"
            metalness={0.9}
            roughness={0.3}
            envMapIntensity={1.5}
          />
        </mesh>
      )

    case 'braided':
      return (
        <group>
          {/* Main tube with texture */}
          <mesh>
            <tubeGeometry args={[curve, 200, 0.025, 8, true]} />
            <meshStandardMaterial
              color="#B8860B"
              metalness={0.4}
              roughness={0.6}
              normalScale={new THREE.Vector2(0.5, 0.5)}
            />
          </mesh>
          {/* Thin overlay for braided effect */}
          <mesh>
            <tubeGeometry args={[curve, 200, 0.026, 3, true]} />
            <meshStandardMaterial
              color="#CD7F32"
              metalness={0.5}
              roughness={0.5}
              wireframe={false}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )

    case 'link':
      // Chain links - oval links that interlock (realistic chain)
      const linkCount = 20 // Reduced for proper interlocking

      return (
        <group>
          {Array.from({ length: linkCount }).map((_, i) => {
            // Position links with offset to create interlocking
            const t = i / linkCount
            const point = curve.getPointAt(t)
            const tangent = curve.getTangentAt(t)

            // Calculate rotation to align with curve
            const angle = Math.atan2(tangent.y, tangent.x)

            // Alternate rotation for interlocking effect
            const isHorizontal = i % 2 === 0

            // For vertical links, offset position slightly forward along curve
            // This makes them pass through the horizontal links
            let finalPoint = point
            if (!isHorizontal) {
              const offsetT = (t + 0.025) % 1  // Small offset forward
              finalPoint = curve.getPointAt(offsetT)
            }

            const rotationZ = isHorizontal ? angle : angle + Math.PI / 2

            return (
              <mesh
                key={i}
                position={finalPoint}
                rotation={[0, 0, rotationZ]}
              >
                <tubeGeometry args={[ovalLinkCurve, 64, 0.015, 8, true]} />
                <meshStandardMaterial
                  color="#FFD700"
                  metalness={0.95}
                  roughness={0.2}
                  envMapIntensity={2}
                />
              </mesh>
            )
          })}
        </group>
      )

    case 'rope':
      return (
        <mesh>
          <tubeGeometry args={[curve, 200, 0.025, 12, true]} />
          <meshStandardMaterial
            color="#8B7355"
            metalness={0.1}
            roughness={0.9}
          />
        </mesh>
      )

    case 'snake':
      return (
        <mesh>
          <tubeGeometry args={[curve, 200, 0.03, 6, true]} />
          <meshStandardMaterial
            color="#E5E4E2"
            metalness={0.95}
            roughness={0.15}
            envMapIntensity={2}
          />
        </mesh>
      )

    default:
      return (
        <mesh>
          <tubeGeometry args={[curve, 200, 0.02, 8, true]} />
          <meshStandardMaterial
            color="#C0C0C0"
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>
      )
  }
}

function SlotIndicators({ positions, chainHeight }: { positions: THREE.Vector3[]; chainHeight: number }) {
  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={[pos.x, chainHeight, pos.z]}>
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
