"use client"

/**
 * Material Debugger - 材质调试工具
 *
 * 开发工具，用于实时查看和调整Spline模型的材质参数
 * 只在开发环境中使用
 *
 * 使用方法：
 * 在 canvas-3d.tsx 或 editor page 中添加：
 * {process.env.NODE_ENV === 'development' && <MaterialDebugger />}
 */

import { useState, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import { getMaterialDebugInfo, MATERIAL_PRESETS } from '@/lib/spline-material-mapper'
import type { MaterialPresetType } from '@/lib/spline-material-mapper'

interface MaterialInfo {
  beadId: string
  beadName: string
  materialType: string
  debugInfo: any[]
}

export function MaterialDebugger() {
  const [isOpen, setIsOpen] = useState(false)
  const [materials, setMaterials] = useState<MaterialInfo[]>([])
  const { beadCatalog } = useEditorStore()

  // 快捷键：按 Ctrl+Shift+M 切换调试面板
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'M' && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // 刷新材质信息（这里是简化版，实际需要通过Three.js scene访问）
  const refreshMaterials = () => {
    // 注意：这里我们只显示catalog中的配置
    // 实际的Three.js材质需要通过ref或其他方式访问
    const info: MaterialInfo[] = beadCatalog
      .filter((bead) => bead.shape === 'spline' && bead.splineUrl)
      .map((bead) => ({
        beadId: bead.id,
        beadName: bead.name,
        materialType: bead.material,
        debugInfo: [
          {
            name: 'Configured',
            config: bead.materialConfig || null,
            baseColor: bead.baseColor,
          },
        ],
      }))

    setMaterials(info)
  }

  useEffect(() => {
    if (isOpen) {
      refreshMaterials()
    }
  }, [isOpen, beadCatalog])

  if (!isOpen) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-black/90 transition-colors z-50"
        onClick={() => setIsOpen(true)}
      >
        <span className="font-mono">Material Debugger (Ctrl+Shift+M)</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Material Debugger</h2>
            <p className="text-white/80 text-sm">Spline材质参数查看器</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
          >
            关闭 (Ctrl+Shift+M)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Material Presets */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              📦 可用材质预设 ({Object.keys(MATERIAL_PRESETS).length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(MATERIAL_PRESETS).map(([name, preset]) => (
                <div
                  key={name}
                  className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                >
                  <div className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                    {name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>金属度: {preset.metalness}</div>
                    <div>粗糙度: {preset.roughness}</div>
                    {preset.transmission !== undefined && preset.transmission > 0 && (
                      <div>透射: {preset.transmission}</div>
                    )}
                    {preset.iridescence !== undefined && preset.iridescence > 0 && (
                      <div>虹彩: {preset.iridescence}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Active Spline Beads */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎨 Spline珠子材质配置 ({materials.length})
              </h3>
              <button
                onClick={refreshMaterials}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                刷新
              </button>
            </div>

            {materials.length === 0 ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-4 text-center">
                <p className="text-yellow-800 dark:text-yellow-300">
                  没有找到Spline珠子。请确保catalog中有shape为'spline'的珠子。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {materials.map((mat) => (
                  <div
                    key={mat.beadId}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Bead Header */}
                    <div className="bg-white dark:bg-gray-800 p-4 border-b-2 border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {mat.beadName}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {mat.beadId} | Material Type: {mat.materialType}
                          </p>
                        </div>
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-white dark:border-gray-600 shadow-lg"
                          style={{
                            backgroundColor: mat.debugInfo[0]?.baseColor || '#ccc',
                          }}
                        />
                      </div>
                    </div>

                    {/* Material Details */}
                    <div className="p-4">
                      {mat.debugInfo.map((info, idx) => (
                        <div key={idx}>
                          {info.config ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                              <h5 className="font-mono text-sm font-semibold mb-2 text-purple-600 dark:text-purple-400">
                                配置的材质参数:
                              </h5>
                              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto">
                                {JSON.stringify(info.config, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ⚠️ 未配置材质参数（将使用默认值）
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Usage Guide */}
          <section className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-300">
              💡 使用指南
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 按 <kbd className="bg-white dark:bg-gray-800 px-2 py-1 rounded border border-blue-300">Ctrl+Shift+M</kbd> 切换调试面板</li>
              <li>• 在catalog中为珠子添加 <code className="bg-white dark:bg-gray-800 px-1 rounded">materialConfig</code> 字段</li>
              <li>• 使用预设类型或自定义PBR参数</li>
              <li>• 查看浏览器Console获取详细的材质加载日志</li>
              <li>• 此工具仅在开发环境中可用</li>
            </ul>
          </section>

          {/* Example Config */}
          <section>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              📝 配置示例
            </h3>
            <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto font-mono">
{`{
  "id": "9",
  "name": "Flow 流动珠",
  "material": "glass",
  "shape": "spline",
  "baseColor": "#FF6DAF",
  "splineUrl": "/models/flow_4.glb",
  "materialConfig": {
    "presetType": "glass",
    "transmission": 0.95,
    "ior": 1.5,
    "metalness": 0,
    "roughness": 0.05
  }
}`}
            </pre>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 border-t-2 border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Material Debugger v1.0 | 仅开发环境 | 快捷键: Ctrl+Shift+M
          </p>
        </div>
      </div>
    </div>
  )
}