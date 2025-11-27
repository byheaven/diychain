"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { PlinkoBoard } from "@/components/game/plinko-board"
import { GameUI } from "@/components/game/game-ui"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function GamePage() {
    const [gameState, setGameState] = useState<'ready' | 'dropping' | 'won' | 'lost'>('ready')
    const [resetTrigger, setResetTrigger] = useState(0)

    const handleDrop = () => {
        if (gameState === 'ready') {
            setGameState('dropping')
        }
    }

    const handleGameEnd = (won: boolean) => {
        // Add a small delay so the user sees the bead land
        setTimeout(() => {
            setGameState(won ? 'won' : 'lost')
        }, 500)
    }

    const handleReset = () => {
        setGameState('ready')
        setResetTrigger(prev => prev + 1)
    }

    return (
        <div className="relative w-full h-screen bg-gradient-to-b from-indigo-900 to-purple-900 overflow-hidden">
            {/* Back Button */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/">
                    <Button variant="ghost" className="text-white hover:bg-white/20">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>
            </div>

            {/* 3D Scene */}
            <div className="absolute inset-0">
                <Canvas shadows camera={{ position: [0, 0, 12], fov: 50 }}>
                    <color attach="background" args={['#1e1b4b']} />
                    <PlinkoBoard
                        onGameEnd={handleGameEnd}
                        isDropping={gameState === 'dropping'}
                        resetTrigger={resetTrigger}
                    />
                </Canvas>
            </div>

            {/* UI Overlay */}
            <GameUI
                gameState={gameState}
                onDrop={handleDrop}
                onReset={handleReset}
            />
        </div>
    )
}
