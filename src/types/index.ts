// Core type definitions for DIY Chain

/**
 * 高级材质配置（用于Spline模型和高级渲染）
 */
export interface AdvancedMaterialConfig {
  // 基础PBR参数
  metalness?: number          // 金属度 (0-1)
  roughness?: number          // 粗糙度 (0-1)

  // 透明度相关
  transparent?: boolean
  opacity?: number            // 不透明度 (0-1)
  transmission?: number       // 透射度 (0-1) - 玻璃效果
  ior?: number                // 折射率 - 玻璃1.5, 水晶1.54

  // 高级属性
  clearcoat?: number          // 清漆层 (0-1) - 陶瓷效果
  clearcoatRoughness?: number
  sheen?: number              // 光泽度 (0-1) - 珍珠效果
  sheenRoughness?: number

  // 发光
  emissiveColor?: string      // 自发光颜色
  emissiveIntensity?: number  // 自发光强度

  // 环境贴图
  envMapIntensity?: number    // 环境贴图强度

  // 特殊效果
  iridescence?: number        // 虹彩效果 (0-1) - 珍珠、肥皂泡
  iridescenceIOR?: number

  // 材质预设类型（与spline-material-mapper.ts对应）
  presetType?: 'glass' | 'crystal' | 'metal' | 'acrylic' | 'ceramic' | 'pearl' | 'resin' | 'default'

  // 是否保留GLB原始颜色（不覆盖）
  preserveColor?: boolean
}

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
  splineUrl?: string          // URL for Spline 3D scene (.splinecode or .glb file path)
  fallbackUrl?: string        // Fallback GLB if splineUrl fails to load
  materialConfig?: AdvancedMaterialConfig  // 高级材质配置（可选）
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
  | 'spline'       // Spline-generated 3D model
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
