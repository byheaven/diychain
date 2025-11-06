"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { BeadList } from "@/components/bead/bead-list"
import { Canvas3D } from "@/components/editor/canvas-3d"
import { PropertyPanel } from "@/components/editor/property-panel"
import { EditorControls } from "@/components/editor/editor-controls"
import { useEditorStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Palette, Box, Settings } from "lucide-react"
import type { Bead } from "@/types"

// Mock bead data
const MOCK_BEADS: Bead[] = [
  {
    id: "1",
    name: "粉色玻璃珠",
    material: "glass",
    shape: "sphere",
    baseColor: "#FF6DAF",
    sizeMm: 8,
    weightG: 0.5,
    priceCents: 500,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "天蓝水晶",
    material: "crystal",
    shape: "sphere",
    baseColor: "#63B3FF",
    sizeMm: 10,
    weightG: 0.8,
    priceCents: 800,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "柠檬黄亚克力",
    material: "acrylic",
    shape: "cube",
    baseColor: "#FFD66D",
    sizeMm: 6,
    weightG: 0.3,
    priceCents: 300,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "薰衣草紫珠",
    material: "glass",
    shape: "heart",
    baseColor: "#B48CFF",
    sizeMm: 12,
    weightG: 1.0,
    priceCents: 1200,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "薄荷绿水晶",
    material: "crystal",
    shape: "sphere",
    baseColor: "#78E3C5",
    sizeMm: 8,
    weightG: 0.6,
    priceCents: 600,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "金属金珠",
    material: "metal-gold",
    shape: "sphere",
    baseColor: "#FFD700",
    sizeMm: 6,
    weightG: 1.5,
    priceCents: 2000,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "银色星星",
    material: "metal-silver",
    shape: "star",
    baseColor: "#C0C0C0",
    sizeMm: 10,
    weightG: 1.2,
    priceCents: 1500,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "玫瑰粉珠",
    material: "acrylic",
    shape: "sphere",
    baseColor: "#FFB6C1",
    sizeMm: 8,
    weightG: 0.4,
    priceCents: 400,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

type MobilePanel = "beads" | "canvas" | "properties"

export default function EditorPage() {
  const { setBeadCatalog, addBeadToChain, chainStructure } = useEditorStore()
  const [mounted, setMounted] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("canvas")

  useEffect(() => {
    setMounted(true)
    setBeadCatalog(MOCK_BEADS)
  }, [setBeadCatalog])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    try {
      const beadData = e.dataTransfer.getData("bead")
      if (beadData) {
        const bead: Bead = JSON.parse(beadData)
        const nextPosition = chainStructure.beads.length
        addBeadToChain(bead, nextPosition)
      }
    } catch (error) {
      console.error("Failed to add bead:", error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />

      {/* Desktop Layout: Three columns */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Left Panel - Bead Library */}
        <div className="w-80 flex-shrink-0">
          <BeadList />
        </div>

        {/* Center - 3D Canvas */}
        <div
          className="flex-1 relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Canvas3D />
          <EditorControls />

          {/* Drop Zone Hint */}
          {chainStructure.beads.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center p-8 rounded-lg bg-background/80 backdrop-blur-sm border-2 border-dashed border-muted-foreground/30">
                <p className="text-lg font-medium">拖拽珠子到这里开始创作</p>
                <p className="text-sm text-muted-foreground mt-2">
                  从左侧选择你喜欢的珠子
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 flex-shrink-0">
          <PropertyPanel />
        </div>
      </div>

      {/* Mobile/Tablet Layout: Single panel with bottom navigation */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Bead Library Panel */}
          <div className={`absolute inset-0 ${mobilePanel === "beads" ? "block" : "hidden"}`}>
            <BeadList />
          </div>

          {/* Canvas Panel */}
          <div
            className={`absolute inset-0 ${mobilePanel === "canvas" ? "block" : "hidden"}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Canvas3D />
            <EditorControls />

            {/* Drop Zone Hint */}
            {chainStructure.beads.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center p-4 mx-4 rounded-lg bg-background/80 backdrop-blur-sm border-2 border-dashed border-muted-foreground/30">
                  <p className="text-base font-medium">点击&ldquo;珠子库&rdquo;选择珠子</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    然后添加到链条中
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Properties Panel */}
          <div className={`absolute inset-0 ${mobilePanel === "properties" ? "block" : "hidden"}`}>
            <PropertyPanel />
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
            <Button
              variant={mobilePanel === "beads" ? "default" : "ghost"}
              size="sm"
              className="flex-1 flex-col h-auto py-2 gap-1"
              onClick={() => setMobilePanel("beads")}
            >
              <Palette className="h-5 w-5" />
              <span className="text-xs">珠子库</span>
            </Button>

            <Button
              variant={mobilePanel === "canvas" ? "default" : "ghost"}
              size="sm"
              className="flex-1 flex-col h-auto py-2 gap-1"
              onClick={() => setMobilePanel("canvas")}
            >
              <Box className="h-5 w-5" />
              <span className="text-xs">编辑</span>
            </Button>

            <Button
              variant={mobilePanel === "properties" ? "default" : "ghost"}
              size="sm"
              className="flex-1 flex-col h-auto py-2 gap-1"
              onClick={() => setMobilePanel("properties")}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">属性</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
