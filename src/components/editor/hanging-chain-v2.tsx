"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody, BallCollider, useSphericalJoint } from "@react-three/rapier"
import type { RapierRigidBody } from "@react-three/rapier"
import * as THREE from "three"
import { useEditorStore } from "@/lib/store"
import { BeadMesh } from "./bead-mesh"

/**
 * HangingChain - Clean implementation with Rapier v2
 */
export function HangingChain() {
  const { chainStructure, beadCatalog } = useEditorStore()
  
  const beadCount = chainStructure.beads.length
  
  // Anchor positions
  const leftAnchor: [number, number, number] = [-2.5, 3, 0]
  const rightAnchor: [number, number, number] = [2.5, 3, 0]

  if (beadCount === 0) {
    return <EmptyChain leftAnchor={leftAnchor} rightAnchor={rightAnchor} />
  }

  return (
    <group>
      {/* Visible anchor markers */}
      <AnchorMarker position={leftAnchor} />
      <AnchorMarker position={rightAnchor} />

      {/* Connected beads */}
      <ConnectedBeads
        beads={chainStructure.beads}
        beadCatalog={beadCatalog}
        leftAnchor={leftAnchor}
        rightAnchor={rightAnchor}
      />
    </group>
  )
}

/**
 * Empty state
 */
function EmptyChain({
  leftAnchor,
  rightAnchor,
}: {
  leftAnchor: [number, number, number]
  rightAnchor: [number, number, number]
}) {
  return (
    <group>
      <AnchorMarker position={leftAnchor} />
      <AnchorMarker position={rightAnchor} />
      <mesh>
        <tubeGeometry 
          args={[
            new THREE.LineCurve3(
              new THREE.Vector3(...leftAnchor),
              new THREE.Vector3(...rightAnchor)
            ),
            20,
            0.02,
            8,
            false
          ]} 
        />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  )
}

/**
 * Anchor marker (visual only)
 */
function AnchorMarker({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
    </mesh>
  )
}

/**
 * Connected beads with physics
 */
function ConnectedBeads({
  beads,
  beadCatalog,
  leftAnchor,
  rightAnchor,
}: {
  beads: any[]
  beadCatalog: any[]
  leftAnchor: [number, number, number]
  rightAnchor: [number, number, number]
}) {
  const leftAnchorRef = useRef<RapierRigidBody>(null!)
  const rightAnchorRef = useRef<RapierRigidBody>(null!)
  const beadRefs = useRef<RapierRigidBody[]>([])

  const beadCount = beads.length

  // Get initial position
  const getInitialPosition = (index: number): [number, number, number] => {
    const t = index / Math.max(beadCount - 1, 1)
    const x = THREE.MathUtils.lerp(leftAnchor[0], rightAnchor[0], t)
    const y = 2.5 - Math.sin(t * Math.PI) * 0.8
    return [x, y, 0]
  }

  return (
    <group>
      {/* Fixed anchors (physics bodies) */}
      <RigidBody ref={leftAnchorRef} type="fixed" position={leftAnchor}>
        <BallCollider args={[0.05]} sensor />
      </RigidBody>
      <RigidBody ref={rightAnchorRef} type="fixed" position={rightAnchor}>
        <BallCollider args={[0.05]} sensor />
      </RigidBody>

      {/* Beads with joints */}
      {beads.map((bead, index) => (
        <ConnectedBead
          key={`bead-${bead.catalogId}-${index}`}
          bead={bead}
          index={index}
          beadCount={beadCount}
          beadCatalog={beadCatalog}
          initialPosition={getInitialPosition(index)}
          beadRefs={beadRefs}
          leftAnchorRef={leftAnchorRef}
          rightAnchorRef={rightAnchorRef}
        />
      ))}
    </group>
  )
}

/**
 * Single bead with its joint connections
 */
function ConnectedBead({
  bead,
  index,
  beadCount,
  beadCatalog,
  initialPosition,
  beadRefs,
  leftAnchorRef,
  rightAnchorRef,
}: {
  bead: any
  index: number
  beadCount: number
  beadCatalog: any[]
  initialPosition: [number, number, number]
  beadRefs: React.MutableRefObject<RapierRigidBody[]>
  leftAnchorRef: React.RefObject<RapierRigidBody>
  rightAnchorRef: React.RefObject<RapierRigidBody>
}) {
  const beadRef = useRef<RapierRigidBody>(null!)
  
  const beadData = beadCatalog.find((b) => b.id === bead.catalogId)
  const beadRadius = ((beadData?.sizeMm || 12) / 1000) / 2
  const beadMass = Math.max((beadData?.weightG || 1.0) / 1000, 0.01)

  const isFirst = index === 0
  const isLast = index === beadCount - 1

  // All hooks must be called unconditionally - use far-away anchors to disable inactive joints
  const prevRef = useRef<RapierRigidBody>(null!)
  const farAway: [number, number, number] = [1000, 1000, 1000]
  
  // Connect to left anchor (first bead only)
  useSphericalJoint(
    leftAnchorRef, 
    beadRef, 
    isFirst ? [[0, -0.1, 0], [0, 0, 0]] : [farAway, farAway]
  )

  // Connect to previous bead (if not first)  
  useSphericalJoint(
    prevRef,
    beadRef,
    !isFirst && index > 0 ? [[0, -0.1, 0], [0, 0.1, 0]] : [farAway, farAway]
  )

  // Connect to right anchor (last bead only)
  useSphericalJoint(
    beadRef,
    rightAnchorRef,
    isLast ? [[0, 0, 0], [0, -0.1, 0]] : [farAway, farAway]
  )
  
  // Update prevRef to point to actual previous bead
  if (index > 0 && beadRefs.current[index - 1]) {
    prevRef.current = beadRefs.current[index - 1]
  }

  return (
    <RigidBody
      ref={(el) => {
        if (el) {
          beadRef.current = el
          beadRefs.current[index] = el
        }
      }}
      type="dynamic"
      position={initialPosition}
      mass={beadMass}
      linearDamping={2.0}
      angularDamping={2.0}
      canSleep={false}
    >
      <BallCollider args={[beadRadius]} />
      <BeadMesh
        bead={bead}
        position={new THREE.Vector3(0, 0, 0)}
        index={index}
      />
    </RigidBody>
  )
}

