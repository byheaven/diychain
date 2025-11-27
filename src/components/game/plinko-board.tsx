"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Physics, RigidBody, CuboidCollider, CylinderCollider, RapierRigidBody } from "@react-three/rapier"
import * as THREE from "three"
import { useEditorStore } from "@/lib/store"
import { BeadMesh } from "@/components/editor/bead-mesh"
import { BeadInChain } from "@/types"

interface PlinkoBoardProps {
    onGameEnd: (won: boolean) => void
    isDropping: boolean
    resetTrigger: number
}

export function PlinkoBoard({ onGameEnd, isDropping, resetTrigger }: PlinkoBoardProps) {
    return (
        <Physics gravity={[0, -9.81, 0]}>
            <BoardScene onGameEnd={onGameEnd} isDropping={isDropping} resetTrigger={resetTrigger} />
        </Physics>
    )
}

function BoardScene({ onGameEnd, isDropping, resetTrigger }: PlinkoBoardProps) {
    const [beadBody, setBeadBody] = useState<RapierRigidBody | null>(null)
    const [beadPosition, setBeadPosition] = useState<[number, number, number]>([0, 6, 0])
    const [gameActive, setGameActive] = useState(false)

    // Reset game state when resetTrigger changes
    useEffect(() => {
        if (beadBody) {
            beadBody.setTranslation({ x: 0, y: 6, z: 0 }, true)
            beadBody.setLinvel({ x: 0, y: 0, z: 0 }, true)
            beadBody.setAngvel({ x: 0, y: 0, z: 0 }, true)
            beadBody.sleep() // Put to sleep until dropped
        }
        setGameActive(false)
    }, [resetTrigger, beadBody])

    // Handle drop
    useEffect(() => {
        if (isDropping && beadBody) {
            beadBody.wakeUp()
            // Add a tiny random horizontal force to make it unpredictable
            const randomX = (Math.random() - 0.5) * 2
            beadBody.applyImpulse({ x: randomX, y: 0, z: 0 }, true)
            setGameActive(true)
        }
    }, [isDropping, beadBody])

    // Peg generation
    const rows = 8
    const pegs = []
    const spacing = 1.2
    const startY = 3

    for (let row = 0; row < rows; row++) {
        const cols = row % 2 === 0 ? 6 : 5
        const rowWidth = (cols - 1) * spacing
        const startX = -rowWidth / 2

        for (let col = 0; col < cols; col++) {
            pegs.push({
                position: [startX + col * spacing, startY - row * spacing * 0.8, 0] as [number, number, number],
                id: `peg-${row}-${col}`
            })
        }
    }

    // Slots at the bottom
    const slotWidth = 1.5
    const slotY = startY - rows * spacing * 0.8 - 1
    const slots = [
        { x: -3, type: 'lose', color: '#ff6b6b' },
        { x: -1.5, type: 'lose', color: '#ff6b6b' },
        { x: 0, type: 'win', color: '#51cf66' }, // Center is win
        { x: 1.5, type: 'lose', color: '#ff6b6b' },
        { x: 3, type: 'lose', color: '#ff6b6b' },
    ]

    // Dummy bead for visualization
    const dummyBead: BeadInChain = {
        catalogId: 'sphere-basic', // Assuming this exists, or we'll use a fallback
        positionIndex: 0,
        scale: 1,
        rotation: [0, 0, 0],
        metalness: 0.5,
        roughness: 0.5,
        colorVariant: '#FFD700' // Gold bead
    }

    return (
        <>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <directionalLight position={[0, 5, 5]} intensity={0.5} />

            {/* The Bead */}
            <RigidBody
                ref={setBeadBody}
                position={[0, 6, 0]}
                colliders="ball"
                restitution={0.5}
                friction={0.1}
                enabledRotations={[true, true, true]}
                type="dynamic"
            >
                <mesh castShadow>
                    <sphereGeometry args={[0.35, 32, 32]} />
                    <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
                </mesh>
            </RigidBody>

            {/* Pegs */}
            {pegs.map((peg) => (
                <RigidBody key={peg.id} position={peg.position} type="fixed" colliders="hull" restitution={0.6}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
                        <meshStandardMaterial color="#ddd" />
                    </mesh>
                </RigidBody>
            ))}

            {/* Walls */}
            <RigidBody type="fixed" restitution={0.5}>
                {/* Left Wall */}
                <CuboidCollider args={[0.5, 10, 1]} position={[-4.5, 0, 0]} />
                {/* Right Wall */}
                <CuboidCollider args={[0.5, 10, 1]} position={[4.5, 0, 0]} />
                {/* Back Wall (visual only usually, but good for physics to keep bead in 2D plane mostly) */}
                <CuboidCollider args={[10, 10, 0.5]} position={[0, 0, -1]} />
                {/* Front Glass (invisible collider) */}
                <CuboidCollider args={[10, 10, 0.5]} position={[0, 0, 1]} />
            </RigidBody>

            {/* Slots / Sensors */}
            {slots.map((slot, i) => (
                <group key={i} position={[slot.x, slotY, 0]}>
                    {/* Visual Divider */}
                    <mesh position={[slotWidth / 2, 0.5, 0]}>
                        <boxGeometry args={[0.1, 1, 0.5]} />
                        <meshStandardMaterial color="#888" />
                    </mesh>

                    {/* Sensor */}
                    <RigidBody type="fixed" sensor onIntersectionEnter={(payload) => {
                        if (payload.other.rigidBody === beadBody && gameActive) {
                            onGameEnd(slot.type === 'win')
                        }
                    }}>
                        <CuboidCollider args={[slotWidth / 2 - 0.1, 0.5, 0.5]} position={[0, 0, 0]} />
                    </RigidBody>

                    {/* Slot Visual */}
                    <mesh position={[0, -0.5, 0]}>
                        <boxGeometry args={[slotWidth - 0.2, 0.2, 0.5]} />
                        <meshStandardMaterial color={slot.color} />
                    </mesh>
                </group>
            ))}

            {/* Floor (Catch-all) */}
            <RigidBody type="fixed" position={[0, slotY - 2, 0]}>
                <CuboidCollider args={[10, 1, 1]} />
            </RigidBody>
        </>
    )
}
