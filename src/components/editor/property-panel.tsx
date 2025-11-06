"use client"

import { useEditorStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function PropertyPanel() {
  const {
    chainStructure,
    selectedBeadIndex,
    updateBeadInChain,
    removeBeadFromChain,
    selectBead,
  } = useEditorStore()

  // Early return if no bead is selected
  if (selectedBeadIndex === null) {
    return (
      <div className="flex flex-col h-full lg:border-l bg-card">
        <div className="p-3 sm:p-4 border-b">
          <h2 className="text-base sm:text-lg font-semibold">属性面板</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 text-center text-muted-foreground">
          <p className="text-sm sm:text-base">选择一个珠子<br />以查看和编辑其属性</p>
        </div>
      </div>
    )
  }

  const selectedBead = chainStructure.beads.find(
    (b) => b.positionIndex === selectedBeadIndex
  )

  if (!selectedBead) {
    return (
      <div className="flex flex-col h-full lg:border-l bg-card">
        <div className="p-3 sm:p-4 border-b">
          <h2 className="text-base sm:text-lg font-semibold">属性面板</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 text-center text-muted-foreground">
          <p className="text-sm sm:text-base">选择一个珠子<br />以查看和编辑其属性</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full lg:border-l bg-card">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold">属性面板</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectBead(null)}
            className="h-8 w-8 text-xl"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Scale */}
        <div>
          <label className="text-sm font-medium block mb-2">
            大小: {selectedBead.scale.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={selectedBead.scale}
            onChange={(e) =>
              updateBeadInChain(selectedBeadIndex, {
                scale: parseFloat(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        {/* Color */}
        <div>
          <label className="text-sm font-medium block mb-2">颜色</label>
          <input
            type="color"
            value={selectedBead.customTint || "#FF6DAF"}
            onChange={(e) =>
              updateBeadInChain(selectedBeadIndex, {
                customTint: e.target.value,
              })
            }
            className="w-full h-10 rounded border cursor-pointer"
          />
        </div>

        {/* Metalness */}
        <div>
          <label className="text-sm font-medium block mb-2">
            金属度: {((selectedBead.metalness ?? 0.2) * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={selectedBead.metalness ?? 0.2}
            onChange={(e) =>
              updateBeadInChain(selectedBeadIndex, {
                metalness: parseFloat(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        {/* Roughness */}
        <div>
          <label className="text-sm font-medium block mb-2">
            粗糙度: {((selectedBead.roughness ?? 0.4) * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={selectedBead.roughness ?? 0.4}
            onChange={(e) =>
              updateBeadInChain(selectedBeadIndex, {
                roughness: parseFloat(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        {/* Position Index */}
        <div>
          <label className="text-sm font-medium block mb-2">
            位置: #{selectedBead.positionIndex + 1}
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 sm:p-4 border-t">
        <Button
          variant="destructive"
          className="w-full h-10 sm:h-auto"
          onClick={() => {
            removeBeadFromChain(selectedBeadIndex)
            selectBead(null)
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          移除珠子
        </Button>
      </div>
    </div>
  )
}
