"use client"

import { useEditorStore } from "@/lib/store"
import { BeadCard } from "./bead-card"
import { BeadFilterBar } from "./bead-filter-bar"

export function BeadList() {
  const { filteredBeads } = useEditorStore()

  return (
    <div className="flex flex-col h-full border-r bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">水晶珠库</h2>
        <p className="text-sm text-muted-foreground">拖动珠子到链条上</p>
      </div>

      {/* Filters */}
      <BeadFilterBar />

      {/* Bead Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredBeads.length > 0 ? (
            filteredBeads.map((bead) => (
              <BeadCard key={bead.id} bead={bead} />
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <p>暂无珠子</p>
              <p className="text-sm mt-2">调整筛选条件或检查数据源</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
