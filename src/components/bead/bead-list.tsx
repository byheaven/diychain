"use client"

import { useEditorStore } from "@/lib/store"
import { BeadCard } from "./bead-card"
import { BeadFilterBar } from "./bead-filter-bar"
import { ChainStyleSelector } from "../editor/chain-style-selector"

export function BeadList() {
  const { filteredBeads } = useEditorStore()

  return (
    <div className="flex flex-col h-full lg:border-r bg-card">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b">
        <h2 className="text-base sm:text-lg font-semibold">水晶珠库</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">拖动珠子到链条上</p>
      </div>

      {/* Chain Style Selector */}
      <ChainStyleSelector />

      {/* Filters */}
      <BeadFilterBar />

      {/* Bead Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-3">
          {filteredBeads.length > 0 ? (
            filteredBeads.map((bead) => (
              <BeadCard key={bead.id} bead={bead} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12 text-muted-foreground">
              <p className="text-sm sm:text-base">暂无珠子</p>
              <p className="text-xs sm:text-sm mt-2">调整筛选条件或检查数据源</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
