"use client"

import { useEditorStore } from "@/lib/store"
import { BeadFilterBar } from "@/components/bead/bead-filter-bar"
import { ChainStyleSelector } from "./chain-style-selector"
import type { Bead } from "@/types"

interface MobileBeadPickerProps {
  onBeadSelect: (bead: Bead) => void
}

export function MobileBeadPicker({ onBeadSelect }: MobileBeadPickerProps) {
  const { filteredBeads } = useEditorStore()

  return (
    <div className="flex flex-col">
      {/* Chain Style Selector */}
      <ChainStyleSelector />

      {/* Filters */}
      <BeadFilterBar />

      {/* Bead Grid */}
      <div className="p-4 pb-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {filteredBeads.length > 0 ? (
            filteredBeads.map((bead) => (
              <button
                key={bead.id}
                onClick={() => onBeadSelect(bead)}
                className="group relative aspect-square rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105 active:scale-95 overflow-hidden bg-card"
              >
                {/* Bead Color Preview */}
                <div
                  className="absolute inset-0 m-2 rounded-md"
                  style={{ backgroundColor: bead.baseColor }}
                />

                {/* Bead Name on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                  <span className="text-white text-xs text-center font-medium">
                    {bead.name}
                  </span>
                </div>

                {/* Material Badge */}
                <div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-medium">
                  {bead.material === "glass" && "玻璃"}
                  {bead.material === "crystal" && "水晶"}
                  {bead.material === "acrylic" && "亚克力"}
                  {bead.material === "metal-gold" && "金"}
                  {bead.material === "metal-silver" && "银"}
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="text-sm">暂无珠子</p>
              <p className="text-xs mt-2">调整筛选条件或检查数据源</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
