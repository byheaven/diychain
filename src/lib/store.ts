import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bead, BeadInChain, ChainStructure, ChainStyle } from '@/types'
import * as THREE from 'three'
import { calculateChainHeight } from './bead-utils'

interface EditorState {
  // Current design
  chainStructure: ChainStructure
  selectedBeadIndex: number | null

  // Chain shape editing
  isChainEditMode: boolean
  chainControlPoints: THREE.Vector3[]
  chainHeight: number  // Dynamic chain height based on bead sizes

  // Bead catalog
  beadCatalog: Bead[]
  filteredBeads: Bead[]

  // Filters
  materialFilter: string | null
  shapeFilter: string | null
  colorFilter: string | null

  // Undo/Redo
  history: ChainStructure[]
  historyIndex: number

  // Actions
  addBeadToChain: (bead: Bead, positionIndex: number) => void
  removeBeadFromChain: (positionIndex: number) => void
  updateBeadInChain: (positionIndex: number, updates: Partial<BeadInChain>) => void
  reorderBead: (fromIndex: number, toIndex: number) => void
  selectBead: (index: number | null) => void

  setBeadCatalog: (beads: Bead[]) => void
  setFilters: (filters: {
    material?: string | null
    shape?: string | null
    color?: string | null
  }) => void

  setChainStyle: (style: ChainStyle) => void

  // Chain shape editing
  toggleChainEditMode: () => void
  updateControlPoint: (index: number, position: THREE.Vector3) => void
  resetChainShape: () => void

  undo: () => void
  redo: () => void

  resetChain: () => void
}

const DEFAULT_CHAIN: ChainStructure = {
  version: '1.0',
  chainMeta: {
    length: 200,
    maxBeads: 50,
    slotSpacing: 4,
    chainStyle: 'simple',
  },
  beads: [],
}

// 创建默认的椭圆形控制点（平放在桌面上）
// 链条高度应该和珠子中心高度一致
const createDefaultControlPoints = (height: number): THREE.Vector3[] => {
  const points: THREE.Vector3[] = []
  const numPoints = 12 // 12个控制点
  const radiusX = 2.0  // X 轴半径
  const radiusZ = 2.5  // Z 轴半径（深度方向）

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2
    const x = Math.cos(angle) * radiusX      // 左右方向
    const y = height                          // 高度（和珠子中心一致）
    const z = Math.sin(angle) * radiusZ      // 前后方向
    points.push(new THREE.Vector3(x, y, z))
  }

  return points
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      chainStructure: DEFAULT_CHAIN,
      selectedBeadIndex: null,
      isChainEditMode: false,
      chainHeight: 0.21, // Default height (largest bead is 0.2, + 0.01 margin)
      chainControlPoints: createDefaultControlPoints(0.21),
      beadCatalog: [],
      filteredBeads: [],
      materialFilter: null,
      shapeFilter: null,
      colorFilter: null,
      history: [DEFAULT_CHAIN],
      historyIndex: 0,

      // Add bead to chain
      addBeadToChain: (bead, positionIndex) => {
        const { chainStructure, history, historyIndex } = get()

        const newBead: BeadInChain = {
          catalogId: bead.id,
          scale: 1.0,
          rotation: [0, 0, 0],
          positionIndex,
          metalness: bead.material.includes('metal') ? 0.8 : 0.2,
          roughness: bead.material === 'glass' || bead.material === 'crystal' ? 0.1 : 0.4,
        }

        const newStructure: ChainStructure = {
          ...chainStructure,
          beads: [...chainStructure.beads, newBead].sort(
            (a, b) => a.positionIndex - b.positionIndex
          ),
        }

        // Update history
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newStructure)

        set({
          chainStructure: newStructure,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        })
      },

      // Remove bead from chain
      removeBeadFromChain: (positionIndex) => {
        const { chainStructure, history, historyIndex } = get()

        const newStructure: ChainStructure = {
          ...chainStructure,
          beads: chainStructure.beads.filter(
            (bead) => bead.positionIndex !== positionIndex
          ),
        }

        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newStructure)

        set({
          chainStructure: newStructure,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          selectedBeadIndex: null,
        })
      },

      // Update bead properties
      updateBeadInChain: (positionIndex, updates) => {
        const { chainStructure, history, historyIndex } = get()

        const newStructure: ChainStructure = {
          ...chainStructure,
          beads: chainStructure.beads.map((bead) =>
            bead.positionIndex === positionIndex ? { ...bead, ...updates } : bead
          ),
        }

        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newStructure)

        set({
          chainStructure: newStructure,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        })
      },

      // Reorder beads
      reorderBead: (fromIndex, toIndex) => {
        const { chainStructure, history, historyIndex } = get()
        const beads = [...chainStructure.beads]
        const [removed] = beads.splice(fromIndex, 1)
        beads.splice(toIndex, 0, removed)

        // Reassign position indices
        const reindexedBeads = beads.map((bead, idx) => ({
          ...bead,
          positionIndex: idx,
        }))

        const newStructure: ChainStructure = {
          ...chainStructure,
          beads: reindexedBeads,
        }

        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newStructure)

        set({
          chainStructure: newStructure,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        })
      },

      // Select bead
      selectBead: (index) => {
        set({ selectedBeadIndex: index })
      },

      // Set bead catalog
      setBeadCatalog: (beads) => {
        // Calculate new chain height based on largest bead
        const newChainHeight = calculateChainHeight(beads)

        // Update control points with new height
        const { chainControlPoints } = get()
        const updatedControlPoints = chainControlPoints.map(
          (point) => new THREE.Vector3(point.x, newChainHeight, point.z)
        )

        set({
          beadCatalog: beads,
          filteredBeads: beads,
          chainHeight: newChainHeight,
          chainControlPoints: updatedControlPoints,
        })
      },

      // Set filters
      setFilters: (filters) => {
        const { beadCatalog, materialFilter, shapeFilter, colorFilter } = get()

        const newMaterialFilter = filters.material !== undefined ? filters.material : materialFilter
        const newShapeFilter = filters.shape !== undefined ? filters.shape : shapeFilter
        const newColorFilter = filters.color !== undefined ? filters.color : colorFilter

        let filtered = beadCatalog

        if (newMaterialFilter) {
          filtered = filtered.filter((bead) => bead.material === newMaterialFilter)
        }
        if (newShapeFilter) {
          filtered = filtered.filter((bead) => bead.shape === newShapeFilter)
        }
        if (newColorFilter) {
          filtered = filtered.filter((bead) =>
            bead.baseColor.toLowerCase().includes(newColorFilter.toLowerCase())
          )
        }

        set({
          materialFilter: newMaterialFilter,
          shapeFilter: newShapeFilter,
          colorFilter: newColorFilter,
          filteredBeads: filtered,
        })
      },

      // Undo
      undo: () => {
        const { history, historyIndex } = get()
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          set({
            chainStructure: history[newIndex],
            historyIndex: newIndex,
          })
        }
      },

      // Redo
      redo: () => {
        const { history, historyIndex } = get()
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1
          set({
            chainStructure: history[newIndex],
            historyIndex: newIndex,
          })
        }
      },

      // Set chain style
      setChainStyle: (style) => {
        const { chainStructure, history, historyIndex } = get()

        const newStructure: ChainStructure = {
          ...chainStructure,
          chainMeta: {
            ...chainStructure.chainMeta,
            chainStyle: style,
          },
        }

        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newStructure)

        set({
          chainStructure: newStructure,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        })
      },

      // Toggle chain edit mode
      toggleChainEditMode: () => {
        set((state) => ({ isChainEditMode: !state.isChainEditMode }))
      },

      // Update control point position
      updateControlPoint: (index, position) => {
        const { chainControlPoints } = get()
        const newPoints = [...chainControlPoints]
        newPoints[index] = position.clone()
        set({ chainControlPoints: newPoints })
      },

      // Reset chain shape to default ellipse
      resetChainShape: () => {
        const { chainHeight } = get()
        set({ chainControlPoints: createDefaultControlPoints(chainHeight) })
      },

      // Reset chain
      resetChain: () => {
        const { chainHeight } = get()
        const newHistory = [DEFAULT_CHAIN]
        set({
          chainStructure: DEFAULT_CHAIN,
          history: newHistory,
          historyIndex: 0,
          selectedBeadIndex: null,
          chainControlPoints: createDefaultControlPoints(chainHeight),
        })
      },
    }),
    {
      name: 'diychain-editor',
      partialize: (state) => ({
        chainStructure: state.chainStructure,
        history: state.history,
        historyIndex: state.historyIndex,
      }),
    }
  )
)
