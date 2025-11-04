"use client"

import { Card } from "@/components/ui/card"
import type { Bead } from "@/types"

interface BeadCardProps {
  bead: Bead
}

export function BeadCard({ bead }: BeadCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("bead", JSON.stringify(bead))
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <Card
      className="p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all hover:scale-105"
      draggable
      onDragStart={handleDragStart}
    >
      {/* Bead Preview */}
      <div
        className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${bead.baseColor}, ${adjustColor(bead.baseColor, 20)})`,
        }}
      >
        <div
          className="w-16 h-16 rounded-full"
          style={{
            background: bead.baseColor,
            boxShadow: `0 4px 12px ${bead.baseColor}40`,
          }}
        />
      </div>

      {/* Bead Info */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm line-clamp-1">{bead.name}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize">{bead.material}</span>
          <span>{bead.sizeMm}mm</span>
        </div>
      </div>
    </Card>
  )
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace("#", ""), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}
