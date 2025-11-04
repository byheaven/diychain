"use client"

import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/lib/store"
import { X } from "lucide-react"

const MATERIALS = [
  { value: "glass", label: "玻璃" },
  { value: "crystal", label: "水晶" },
  { value: "acrylic", label: "亚克力" },
  { value: "metal-gold", label: "金属金" },
  { value: "metal-silver", label: "金属银" },
]

const SHAPES = [
  { value: "sphere", label: "球形" },
  { value: "cube", label: "方形" },
  { value: "heart", label: "心形" },
  { value: "star", label: "星形" },
]

export function BeadFilterBar() {
  const { materialFilter, shapeFilter, setFilters } = useEditorStore()

  const clearFilters = () => {
    setFilters({ material: null, shape: null, color: null })
  }

  const hasActiveFilters = materialFilter || shapeFilter

  return (
    <div className="p-4 border-b space-y-3">
      {/* Material Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-muted-foreground">材质</label>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              清除
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map((material) => (
            <Button
              key={material.value}
              variant={materialFilter === material.value ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setFilters({
                  material: materialFilter === material.value ? null : material.value,
                })
              }
              className="text-xs h-7"
            >
              {material.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Shape Filter */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">
          形状
        </label>
        <div className="flex flex-wrap gap-2">
          {SHAPES.map((shape) => (
            <Button
              key={shape.value}
              variant={shapeFilter === shape.value ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setFilters({
                  shape: shapeFilter === shape.value ? null : shape.value,
                })
              }
              className="text-xs h-7"
            >
              {shape.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
