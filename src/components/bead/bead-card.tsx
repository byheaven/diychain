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

  // Get shape-specific styles
  const getShapeStyles = () => {
    const baseStyle = {
      background: bead.baseColor,
      boxShadow: `0 4px 12px ${bead.baseColor}40, inset 0 2px 4px rgba(255, 255, 255, 0.3)`,
      border: '3px solid rgba(255, 255, 255, 0.6)',
    }

    switch (bead.shape) {
      case 'sphere':
        return {
          className: 'w-16 h-16 rounded-full',
          style: baseStyle,
        }
      case 'cube':
        return {
          className: 'w-14 h-14 rounded-md',
          style: baseStyle,
        }
      case 'cylinder':
        return {
          className: 'w-12 h-16 rounded-full',
          style: baseStyle,
        }
      case 'heart':
        return {
          className: 'w-16 h-16',
          style: baseStyle,
          content: '❤️',
        }
      case 'star':
        return {
          className: 'w-16 h-16',
          style: baseStyle,
          content: '⭐',
        }
      case 'flower':
        return {
          className: 'w-16 h-16',
          style: baseStyle,
          content: '🌸',
        }
      default:
        return {
          className: 'w-16 h-16 rounded-full',
          style: baseStyle,
        }
    }
  }

  const shapeConfig = getShapeStyles()

  return (
    <Card
      className="p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all hover:scale-105"
      draggable
      onDragStart={handleDragStart}
    >
      {/* Bead Preview */}
      <div
        className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
      >
        {shapeConfig.content ? (
          // Show emoji for special shapes with colored background
          <div className="relative">
            <div
              className="absolute inset-0 blur-lg opacity-50 rounded-full"
              style={{ background: bead.baseColor }}
            />
            <div className="text-5xl flex items-center justify-center relative z-10">
              {shapeConfig.content}
            </div>
          </div>
        ) : (
          // Show colored shape for geometric forms
          <div
            className={shapeConfig.className}
            style={shapeConfig.style}
          />
        )}
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
