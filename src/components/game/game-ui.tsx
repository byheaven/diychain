"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEditorStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, RefreshCcw, ArrowDown } from "lucide-react"

interface GameUIProps {
    gameState: 'ready' | 'dropping' | 'won' | 'lost'
    onDrop: () => void
    onReset: () => void
}

export function GameUI({ gameState, onDrop, onReset }: GameUIProps) {
    const { unlockReward, isRewardUnlocked } = useEditorStore()

    // Unlock reward when game is won
    useEffect(() => {
        if (gameState === 'won' && !isRewardUnlocked) {
            unlockReward()
        }
    }, [gameState, isRewardUnlocked, unlockReward])

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 z-10">
            {/* Header */}
            <div className="mt-8 text-center pointer-events-auto">
                <h1 className="text-4xl font-bold text-white drop-shadow-md mb-2">Lucky Drop</h1>
                <p className="text-white/90 text-lg drop-shadow-sm">
                    Drop the bead into the green slot to win a limited edition bead!
                </p>
            </div>

            {/* Controls */}
            <div className="mb-12 pointer-events-auto">
                {gameState === 'ready' && (
                    <Button
                        size="lg"
                        className="text-xl px-8 py-6 rounded-full shadow-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-2 border-white/20"
                        onClick={onDrop}
                    >
                        <ArrowDown className="mr-2 h-6 w-6" />
                        Drop Bead
                    </Button>
                )}

                {gameState === 'dropping' && (
                    <div className="text-white text-xl font-semibold animate-pulse">
                        Good luck...
                    </div>
                )}
            </div>

            {/* Result Modals */}
            <AnimatePresence>
                {gameState === 'won' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-auto"
                    >
                        <Card className="w-80 p-6 text-center bg-white/95 backdrop-blur border-4 border-yellow-400">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-yellow-100 rounded-full">
                                    <Trophy className="h-12 w-12 text-yellow-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">You Won!</h2>
                            <p className="text-gray-600 mb-6">
                                Congratulations! You've unlocked the <span className="font-bold text-pink-600">Limited Edition Star Bead</span>.
                            </p>
                            <div className="space-y-3">
                                <Button className="w-full" onClick={() => window.location.href = '/editor'}>
                                    Go to Editor
                                </Button>
                                <Button variant="outline" className="w-full" onClick={onReset}>
                                    Play Again
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {gameState === 'lost' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-auto"
                    >
                        <Card className="w-80 p-6 text-center bg-white/95 backdrop-blur">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-gray-100 rounded-full">
                                    <RefreshCcw className="h-12 w-12 text-gray-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">So Close!</h2>
                            <p className="text-gray-600 mb-6">
                                The bead didn't land in the winning slot. Give it another try!
                            </p>
                            <Button className="w-full" onClick={onReset}>
                                Try Again
                            </Button>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
