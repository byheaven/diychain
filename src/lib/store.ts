import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bead, BeadInChain, ChainStructure } from '@/types'

interface EditorState {
  // Current design
  chainStructure: ChainStructure
  selectedBeadIndex: number | null

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
  },
  beads: [],
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      chainStructure: DEFAULT_CHAIN,
      selectedBeadIndex: null,
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
        set({ beadCatalog: beads, filteredBeads: beads })
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

      // Reset chain
      resetChain: () => {
        const newHistory = [DEFAULT_CHAIN]
        set({
          chainStructure: DEFAULT_CHAIN,
          history: newHistory,
          historyIndex: 0,
          selectedBeadIndex: null,
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
