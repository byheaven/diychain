// Core type definitions for DIY Chain

export interface Bead {
  id: string
  name: string
  material: BeadMaterial
  shape: BeadShape
  baseColor: string
  sizeMm: number
  weightG: number
  textureUrl?: string
  normalMapUrl?: string
  priceCents: number
  isActive: boolean
  createdAt: string
}

export type BeadMaterial =
  | 'glass'
  | 'crystal'
  | 'acrylic'
  | 'metal-gold'
  | 'metal-silver'
  | 'wood'
  | 'plastic'

export type BeadShape =
  | 'sphere'
  | 'cube'
  | 'cylinder'
  | 'heart'
  | 'star'
  | 'flower'
  | 'custom'

export type ChainStyle =
  | 'simple'      // 简单圆管
  | 'braided'     // 编织链
  | 'link'        // 金属环链
  | 'rope'        // 绳索链
  | 'snake'       // 蛇骨链

export interface BeadInChain {
  catalogId: string
  colorVariant?: string
  scale: number
  rotation: [number, number, number]
  positionIndex: number
  customTint?: string
  metalness?: number
  roughness?: number
}

export interface ChainMeta {
  length: number
  maxBeads: number
  slotSpacing: number
  chainStyle?: ChainStyle
}

export interface ChainStructure {
  version: string
  camera?: {
    position: [number, number, number]
    target: [number, number, number]
  }
  lighting?: {
    intensity: number
    color: string
  }
  chainMeta: ChainMeta
  beads: BeadInChain[]
}

export interface Design {
  id: string
  userId: string
  title: string
  chainStructure: ChainStructure
  previewImageUrl?: string
  isPublic: boolean
  shareSlug?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  nickname?: string
  avatarUrl?: string
  createdAt: string
}

export interface Favorite {
  id: string
  userId: string
  designId: string
  createdAt: string
}
