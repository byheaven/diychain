/**
 * Spline Material Mapper
 *
 * 核心功能：将Spline导出的材质正确映射到Three.js的PBR材质系统
 * 解决材质还原问题，支持玻璃、金属、亚克力等特殊材质
 */

import * as THREE from 'three'

/**
 * 材质类型定义
 */
export type MaterialPresetType =
  | 'glass'           // 玻璃/水晶
  | 'crystal'         // 透明水晶
  | 'metal'           // 金属
  | 'acrylic'         // 亚克力（不透明塑料）
  | 'ceramic'         // 陶瓷
  | 'pearl'           // 珍珠（带虹彩效果）
  | 'resin'           // 树脂（半透明）
  | 'default'         // 默认标准材质

/**
 * 材质配置接口
 */
export interface MaterialConfig {
  // 基础PBR参数
  metalness: number          // 金属度 (0-1)
  roughness: number          // 粗糙度 (0-1)

  // 透明度相关
  transparent: boolean
  opacity: number            // 不透明度 (0-1)
  transmission: number       // 透射度 (0-1) - 用于玻璃等透明材质
  ior: number                // 折射率 - 玻璃1.5, 水晶1.54, 亚克力1.49

  // 高级属性
  clearcoat: number          // 清漆层 (0-1) - 用于汽车漆、陶瓷效果
  clearcoatRoughness: number
  sheen: number              // 光泽度 (0-1) - 用于织物、绒毛效果
  sheenRoughness: number
  sheenColor?: THREE.Color

  // 发光
  emissive?: THREE.Color     // 自发光颜色
  emissiveIntensity: number  // 自发光强度

  // 环境贴图
  envMapIntensity: number    // 环境贴图强度

  // 其他
  side: THREE.Side           // 单面/双面渲染
  alphaTest: number          // Alpha测试阈值

  // 特殊效果
  iridescence: number        // 虹彩效果 (0-1) - 用于珍珠、肥皂泡
  iridescenceIOR: number

  // 颜色处理
  preserveColor: boolean     // 是否保留GLB原始颜色
}

/**
 * 材质预设库
 * 根据DIY Chain项目的珠子材质类型定制
 */
export const MATERIAL_PRESETS: Record<MaterialPresetType, Partial<MaterialConfig>> = {
  // 玻璃材质 - 高透明度，中等折射
  glass: {
    metalness: 0,
    roughness: 0.05,
    transparent: true,
    opacity: 0.3,
    transmission: 0.95,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.0,
    side: THREE.DoubleSide,
    emissiveIntensity: 0,
    sheen: 0,
    sheenRoughness: 1.0,
    iridescence: 0,
    iridescenceIOR: 1.3,
    alphaTest: 0,
    preserveColor: false,
  },

  // 水晶材质 - 更高折射率，棱角分明的反射
  crystal: {
    metalness: 0,
    roughness: 0.02,
    transparent: true,
    opacity: 0.25,
    transmission: 0.98,
    ior: 1.54,
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
    envMapIntensity: 2.5,
    side: THREE.DoubleSide,
    emissiveIntensity: 0,
    sheen: 0,
    sheenRoughness: 1.0,
    iridescence: 0.3,
    iridescenceIOR: 1.4,
    alphaTest: 0,
    preserveColor: false,
  },

  // 金属材质 - 高金属度，低粗糙度
  metal: {
    metalness: 1.0,
    roughness: 0.15,
    transparent: false,
    opacity: 1.0,
    transmission: 0,
    ior: 1.45,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
    side: THREE.FrontSide,
    emissiveIntensity: 0,
    sheen: 0,
    sheenRoughness: 1.0,
    iridescence: 0,
    iridescenceIOR: 1.3,
    alphaTest: 0,
    preserveColor: true,
  },

  // 亚克力材质 - 不透明塑料，高光泽
  acrylic: {
    metalness: 0.1,
    roughness: 0.2,
    transparent: false,
    opacity: 1.0,
    transmission: 0,
    ior: 1.49,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.2,
    side: THREE.FrontSide,
    emissiveIntensity: 0,
    sheen: 0,
    sheenRoughness: 1.0,
    iridescence: 0,
    iridescenceIOR: 1.3,
    alphaTest: 0,
    preserveColor: false,
  },

  // 陶瓷材质 - 光滑表面，清漆效果
  ceramic: {
    metalness: 0,
    roughness: 0.1,
    transparent: false,
    opacity: 1.0,
    transmission: 0,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.0,
    side: THREE.FrontSide,
    emissiveIntensity: 0,
    sheen: 0,
    sheenRoughness: 1.0,
    iridescence: 0,
    iridescenceIOR: 1.3,
    alphaTest: 0,
    preserveColor: false,
  },

  // 珍珠材质 - 虹彩效果，柔和光泽
  pearl: {
    metalness: 0,
    roughness: 0.4,
    transparent: false,
    opacity: 1.0,
    transmission: 0,
    ior: 1.53,
    clearcoat: 0.6,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1.0,
    side: THREE.FrontSide,
    emissiveIntensity: 0,
    sheen: 0.8,
    sheenRoughness: 0.5,
    iridescence: 0.7,
    iridescenceIOR: 1.6,
    alphaTest: 0,
    preserveColor: false,
    sheenColor: new THREE.Color(0xffffff),
  },

  // 树脂材质 - 半透明，柔和
  resin: {
    metalness: 0,
    roughness: 0.25,
    transparent: true,
    opacity: 0.7,
    transmission: 0.5,
    ior: 1.54,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.0,
    side: THREE.DoubleSide,
    emissiveIntensity: 0,
    sheen: 0,
    sheenRoughness: 1.0,
    iridescence: 0,
    iridescenceIOR: 1.3,
    alphaTest: 0,
    preserveColor: false,
  },

  // 默认材质 - 标准PBR
  default: {
    metalness: 0.5,
    roughness: 0.3,
    transparent: false,
    opacity: 1.0,
    transmission: 0,
    ior: 1.45,
    clearcoat: 0,
    clearcoatRoughness: 0.5,
    envMapIntensity: 1.0,
    side: THREE.FrontSide,
    emissiveIntensity: 0,
    sheen: 0,
    sheenRoughness: 1.0,
    iridescence: 0,
    iridescenceIOR: 1.3,
    alphaTest: 0,
    preserveColor: false,
  },
}

/**
 * 应用材质配置到Three.js材质
 *
 * @param material - Three.js材质对象（通常是MeshStandardMaterial或MeshPhysicalMaterial）
 * @param config - 材质配置
 * @param baseColor - 可选的基础颜色（用于覆盖）
 */
export function applyMaterialConfig(
  material: THREE.Material,
  config: Partial<MaterialConfig>,
  baseColor?: string | THREE.Color
): void {
  // 确保使用MeshPhysicalMaterial以支持高级特性
  if (!(material instanceof THREE.MeshStandardMaterial)) {
    console.warn('Material is not MeshStandardMaterial, skipping advanced config')
    return
  }

  // 基础PBR参数
  if (config.metalness !== undefined) material.metalness = config.metalness
  if (config.roughness !== undefined) material.roughness = config.roughness

  // 透明度
  if (config.transparent !== undefined) material.transparent = config.transparent
  if (config.opacity !== undefined) material.opacity = config.opacity

  // 环境贴图强度
  if (config.envMapIntensity !== undefined) {
    material.envMapIntensity = config.envMapIntensity
  }

  // 发光
  if (config.emissive) {
    material.emissive = config.emissive
  }
  if (config.emissiveIntensity !== undefined) {
    material.emissiveIntensity = config.emissiveIntensity
  }

  // 渲染面
  if (config.side !== undefined) material.side = config.side

  // Alpha测试
  if (config.alphaTest !== undefined) material.alphaTest = config.alphaTest

  // 高级特性（仅MeshPhysicalMaterial支持）
  if (material instanceof THREE.MeshPhysicalMaterial) {
    if (config.transmission !== undefined) material.transmission = config.transmission
    if (config.ior !== undefined) material.ior = config.ior
    if (config.clearcoat !== undefined) material.clearcoat = config.clearcoat
    if (config.clearcoatRoughness !== undefined) {
      material.clearcoatRoughness = config.clearcoatRoughness
    }
    if (config.sheen !== undefined) material.sheen = config.sheen
    if (config.sheenRoughness !== undefined) {
      material.sheenRoughness = config.sheenRoughness
    }
    if (config.sheenColor) {
      material.sheenColor = config.sheenColor
    }
    if (config.iridescence !== undefined) material.iridescence = config.iridescence
    if (config.iridescenceIOR !== undefined) {
      material.iridescenceIOR = config.iridescenceIOR
    }
  }

  // 颜色处理
  if (baseColor && !config.preserveColor) {
    const color = typeof baseColor === 'string' ? new THREE.Color(baseColor) : baseColor
    material.color = color
  }

  // 更新材质
  material.needsUpdate = true
}

/**
 * 从Spline GLB中提取材质信息并应用预设
 *
 * @param gltf - 加载的GLTF对象
 * @param materialType - 材质预设类型
 * @param baseColor - 可选的基础颜色
 * @param customConfig - 自定义配置（会覆盖预设）
 */
export function enhanceSplineMaterials(
  gltf: { scene: THREE.Group },
  materialType: MaterialPresetType = 'default',
  baseColor?: string | THREE.Color,
  customConfig?: Partial<MaterialConfig>
): void {
  // 获取预设配置
  const presetConfig = MATERIAL_PRESETS[materialType]

  // 合并自定义配置
  const finalConfig = { ...presetConfig, ...customConfig }

  // 遍历场景中的所有对象
  gltf.scene.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh && child.material) {
      // 处理单个材质
      if (!Array.isArray(child.material)) {
        enhanceSingleMaterial(child.material, finalConfig, baseColor)
      } else {
        // 处理材质数组
        child.material.forEach((mat: THREE.Material) => {
          enhanceSingleMaterial(mat, finalConfig, baseColor)
        })
      }

      // 启用阴影
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

/**
 * 增强单个材质
 */
function enhanceSingleMaterial(
  material: THREE.Material,
  config: Partial<MaterialConfig>,
  baseColor?: string | THREE.Color
): void {
  // 如果是MeshBasicMaterial，升级为MeshPhysicalMaterial
  if (material instanceof THREE.MeshBasicMaterial &&
      !(material instanceof THREE.MeshStandardMaterial)) {
    console.log('Converting MeshBasicMaterial to MeshPhysicalMaterial')
    // 注意：这里我们不能直接替换材质，需要在外部处理
    // 这里只是标记和警告
  }

  // 应用配置
  applyMaterialConfig(material, config, baseColor)
}

/**
 * 检测材质是否需要颜色覆盖
 * Spline有时会导出纯白色(#ffffff)或null颜色
 */
export function shouldOverrideColor(material: THREE.Material): boolean {
  if (!(material instanceof THREE.MeshStandardMaterial)) return false

  const color = material.color
  const threshold = 0.98

  // 检查是否接近纯白色
  return color.r > threshold && color.g > threshold && color.b > threshold
}

/**
 * 材质调试信息
 */
export interface MaterialDebugInfo {
  name: string
  type: string
  color: string
  metalness: number
  roughness: number
  transparent: boolean
  opacity: number
  transmission?: number
  ior?: number
  clearcoat?: number
  envMapIntensity: number
}

/**
 * 提取材质调试信息
 */
export function getMaterialDebugInfo(material: THREE.Material): MaterialDebugInfo {
  const info: MaterialDebugInfo = {
    name: material.name || 'Unnamed',
    type: material.type,
    color: '#000000',
    metalness: 0,
    roughness: 0,
    transparent: material.transparent,
    opacity: material.opacity,
    envMapIntensity: 1.0,
  }

  if (material instanceof THREE.MeshStandardMaterial) {
    info.color = '#' + material.color.getHexString()
    info.metalness = material.metalness
    info.roughness = material.roughness
    info.envMapIntensity = material.envMapIntensity

    if (material instanceof THREE.MeshPhysicalMaterial) {
      info.transmission = material.transmission
      info.ior = material.ior
      info.clearcoat = material.clearcoat
    }
  }

  return info
}

/**
 * 创建自定义PBR材质（用于替换MeshBasicMaterial）
 */
export function createEnhancedMaterial(
  materialType: MaterialPresetType,
  baseColor?: string | THREE.Color,
  customConfig?: Partial<MaterialConfig>
): THREE.MeshPhysicalMaterial {
  const config = { ...MATERIAL_PRESETS[materialType], ...customConfig }

  const material = new THREE.MeshPhysicalMaterial({
    color: baseColor ? (typeof baseColor === 'string' ? baseColor : baseColor) : 0xffffff,
    metalness: config.metalness ?? 0.5,
    roughness: config.roughness ?? 0.3,
    transparent: config.transparent ?? false,
    opacity: config.opacity ?? 1.0,
    transmission: config.transmission ?? 0,
    ior: config.ior ?? 1.45,
    clearcoat: config.clearcoat ?? 0,
    clearcoatRoughness: config.clearcoatRoughness ?? 0.5,
    sheen: config.sheen ?? 0,
    sheenRoughness: config.sheenRoughness ?? 1.0,
    sheenColor: config.sheenColor,
    envMapIntensity: config.envMapIntensity ?? 1.0,
    side: config.side ?? THREE.FrontSide,
    emissive: config.emissive ?? new THREE.Color(0x000000),
    emissiveIntensity: config.emissiveIntensity ?? 0,
    iridescence: config.iridescence ?? 0,
    iridescenceIOR: config.iridescenceIOR ?? 1.3,
    alphaTest: config.alphaTest ?? 0,
  })

  return material
}
