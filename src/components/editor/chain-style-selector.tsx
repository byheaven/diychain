"use client"

import { useEditorStore } from "@/lib/store"
import { Link2, Edit3, Check } from "lucide-react"
import type { ChainStyle } from "@/types"

const CHAIN_STYLES: Array<{
  id: ChainStyle
  name: string
  icon: string
  description: string
}> = [
  {
    id: 'simple',
    name: '简单链',
    icon: '⚪',
    description: '光滑圆管',
  },
  {
    id: 'braided',
    name: '编织链',
    icon: '🔗',
    description: '编织纹理',
  },
  {
    id: 'link',
    name: '金属环链',
    icon: '⛓️',
    description: '环环相扣',
  },
] as const

export function ChainStyleSelector() {
  const { chainStructure, setChainStyle, isChainEditMode, toggleChainEditMode, resetChainShape } = useEditorStore()
  const currentStyle = chainStructure.chainMeta.chainStyle || 'simple'

  return (
    <div className="p-4 border-b space-y-4">
      {/* Chain Shape Edit Mode Toggle */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Edit3 className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">链条形状</label>
        </div>

        <button
          onClick={toggleChainEditMode}
          className={`
            w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all
            ${
              isChainEditMode
                ? 'border-green-500 bg-green-500/10'
                : 'border-border hover:border-primary/50 hover:bg-accent'
            }
          `}
        >
          {isChainEditMode ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <Edit3 className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">
              {isChainEditMode ? '完成编辑' : '编辑形状'}
            </div>
            <div className="text-xs text-muted-foreground">
              {isChainEditMode ? '点击完成或拖动控制点' : '拖动控制点改变链条形状'}
            </div>
          </div>
        </button>

        {isChainEditMode && (
          <button
            onClick={resetChainShape}
            className="w-full mt-2 p-2 text-xs rounded border border-border hover:bg-accent transition-colors"
          >
            重置为默认形状
          </button>
        )}
      </div>

      {/* Chain Style Selector */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">链条样式</label>
        </div>

        <div className="space-y-2">
          {CHAIN_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setChainStyle(style.id)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                ${
                  currentStyle === style.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                }
              `}
            >
              <span className="text-2xl">{style.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{style.name}</div>
                <div className="text-xs text-muted-foreground">{style.description}</div>
              </div>
              {currentStyle === style.id && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
