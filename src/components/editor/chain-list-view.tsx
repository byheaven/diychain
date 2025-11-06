"use client"

import { useEditorStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Trash2, GripVertical } from "lucide-react"

export function ChainListView() {
  const {
    chainStructure,
    selectBead,
    selectedBeadIndex,
    removeBeadFromChain,
  } = useEditorStore()

  if (chainStructure.beads.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-base mb-2">链条还是空的</p>
        <p className="text-sm">点击&ldquo;添加珠子&rdquo;开始创作吧！</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">
      {chainStructure.beads.map((bead) => (
        <div
          key={`${bead.catalogId}-${bead.positionIndex}`}
          className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors ${
            selectedBeadIndex === bead.positionIndex
              ? "border-primary ring-2 ring-primary/20"
              : "border-border"
          }`}
          onClick={() => selectBead(bead.positionIndex)}
        >
          {/* Drag Handle */}
          <div className="text-muted-foreground cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Bead Preview */}
          <div
            className="w-12 h-12 rounded-lg border-2 flex-shrink-0"
            style={{
              backgroundColor: bead.customTint || bead.colorVariant,
              borderColor: bead.customTint || bead.colorVariant,
            }}
          />

          {/* Bead Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              珠子 #{bead.positionIndex + 1}
            </p>
            <p className="text-xs text-muted-foreground">
              大小: {bead.scale.toFixed(1)}x
            </p>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation()
              removeBeadFromChain(bead.positionIndex)
              if (selectedBeadIndex === bead.positionIndex) {
                selectBead(null)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
