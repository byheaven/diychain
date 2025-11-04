"use client"

import { Button } from "@/components/ui/button"
import { Undo2, Redo2 } from "lucide-react"
import { useEditorStore } from "@/lib/store"

export function EditorControls() {
  const { undo, redo, history, historyIndex } = useEditorStore()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/90 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        title="撤销 (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4 mr-2" />
        撤销
      </Button>

      <div className="w-px h-6 bg-border" />

      <Button
        variant="ghost"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        title="重做 (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4 mr-2" />
        重做
      </Button>

      <div className="w-px h-6 bg-border" />

      <div className="text-xs text-muted-foreground px-2">
        步骤: {historyIndex + 1}/{history.length}
      </div>
    </div>
  )
}
