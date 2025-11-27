"use client"

import React, { useRef, useMemo, forwardRef } from "react"
import { RigidBody, BallCollider, useSphericalJoint } from "@react-three/rapier"
import type { RapierRigidBody } from "@react-three/rapier"
import * as THREE from "three"
import { useEditorStore } from "@/lib/store"
import { BeadMesh } from "./bead-mesh"
import type { Bead, BeadInChain } from "@/types"

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
 * Joint component to connect two bodies
 */
const ChainJoint = ({
  bodyA,
  bodyB,
  anchorA,
  anchorB,
}: {
  bodyA: React.RefObject<RapierRigidBody>
  bodyB: React.RefObject<RapierRigidBody>
  anchorA: [number, number, number]
  anchorB: [number, number, number]
}) => {
  useSphericalJoint(bodyA, bodyB, [anchorA, anchorB])
  return null
}

/**
 * Single Physics Bead Component
 */
const PhysicsBead = forwardRef<RapierRigidBody, {
  bead: BeadInChain
  index: number
  beadCatalog: Bead[]
  initialPosition: [number, number, number]
}>(({ bead, index, beadCatalog, initialPosition }, ref) => {
  const beadData = beadCatalog.find((b) => b.id === bead.catalogId)

  // Use 0.2 as base radius to match BeadMesh visual size
  // BeadMesh uses size=0.2 for geometry radius
  const beadRadius = 0.2 * (bead.scale || 1.0)

  const beadMass = Math.max((beadData?.weightG || 1.0) / 1000, 0.01)

  return (
    <RigidBody
      ref={ref}
      type="dynamic"
      position={initialPosition}
      mass={beadMass}
      linearDamping={2.0}
      angularDamping={2.0}
      canSleep={false}
      colliders={false} // We add collider manually
    >
      <BallCollider args={[beadRadius]} />
      <BeadMesh
        bead={bead}
        position={new THREE.Vector3(0, 0, 0)}
        index={index}
        useChainHeight={false}
      />
    </RigidBody>
  )
})
PhysicsBead.displayName = "PhysicsBead"

/**
 * Connected beads with physics
 */
function ConnectedBeads({
  beads,
  beadCatalog,
  leftAnchor,
  rightAnchor,
}: {
  beads: BeadInChain[]
  beadCatalog: Bead[]
  leftAnchor: [number, number, number]
  rightAnchor: [number, number, number]
}) {
  const leftAnchorRef = useRef<RapierRigidBody>(null!)
  const rightAnchorRef = useRef<RapierRigidBody>(null!)

  // Create stable refs for all beads
  // We use useMemo to ensure the array of refs remains stable unless bead count changes
  const beadRefs = useMemo(() =>
    Array(beads.length).fill(0).map(() => React.createRef<RapierRigidBody>()),
    [beads.length]
  )

  // Get initial position
  const getInitialPosition = (index: number): [number, number, number] => {
    const t = index / Math.max(beads.length - 1, 1)
    const x = THREE.MathUtils.lerp(leftAnchor[0], rightAnchor[0], t)
    const y = 2.5 - Math.sin(t * Math.PI) * 0.8
    return [x, y, 0]
  }

  return (
    <group>
      {/* Fixed anchors (physics bodies) */}
      <RigidBody ref={leftAnchorRef} type="fixed" position={leftAnchor}>
        <BallCollider args={[0.1]} sensor />
      </RigidBody>
      <RigidBody ref={rightAnchorRef} type="fixed" position={rightAnchor}>
        <BallCollider args={[0.1]} sensor />
      </RigidBody>

      {/* Beads */}
      {beads.map((bead, index) => (
        <PhysicsBead
          key={`bead-${bead.catalogId}-${index}`}
          ref={beadRefs[index]}
          bead={bead}
          index={index}
          beadCatalog={beadCatalog}
          initialPosition={getInitialPosition(index)}
        />
      ))}

      {/* Joints */}
      {beads.length > 0 && (
        <>
          {/* Left Anchor -> First Bead */}
          {/* Anchor Bottom (-0.1) -> Bead Top (+radius) */}
          <ChainJoint
            bodyA={leftAnchorRef}
            bodyB={beadRefs[0]}
            anchorA={[0, -0.1, 0]}
            anchorB={[0, 0.2 * (beads[0].scale || 1.0), 0]}
          />

          {/* Bead -> Bead */}
          {beads.map((_, index) => {
            if (index === 0) return null
            const prevBead = beads[index - 1]
            const currBead = beads[index]

            const prevRadius = 0.2 * (prevBead.scale || 1.0)
            const currRadius = 0.2 * (currBead.scale || 1.0)

            return (
              <ChainJoint
                key={`joint-${index}`}
                bodyA={beadRefs[index - 1]}
                bodyB={beadRefs[index]}
                anchorA={[0, -prevRadius, 0]} // Bottom of prev
                anchorB={[0, currRadius, 0]}  // Top of curr
              />
            )
          })}

          {/* Last Bead -> Right Anchor */}
          {/* Bead Top (+radius) -> Anchor Bottom (-0.1) */}
          <ChainJoint
            bodyA={beadRefs[beads.length - 1]}
            bodyB={rightAnchorRef}
            anchorA={[0, 0.2 * (beads[beads.length - 1].scale || 1.0), 0]}
            anchorB={[0, -0.1, 0]}
          />
        </>
      )}
    </group>
  )
}
