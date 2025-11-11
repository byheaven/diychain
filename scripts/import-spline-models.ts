#!/usr/bin/env tsx

/**
 * Spline GLB Model Batch Import Tool
 *
 * 功能：
 * - 扫描指定目录下的所有GLB文件
 * - 分析模型元数据（文件大小、面数估算等）
 * - 生成bead catalog JSON条目
 * - 验证GLB文件格式
 *
 * 使用方法：
 *   npm run import-models -- --input ./raw-models --output ./public/models
 *   或者
 *   npx tsx scripts/import-spline-models.ts --input ./raw-models
 *
 * 选项：
 *   --input <dir>    输入目录路径（包含GLB文件）
 *   --output <dir>   输出目录路径（默认：./public/models）
 *   --catalog <file> 生成的catalog文件路径（默认：./generated-catalog.json）
 *   --copy           是否复制文件到output目录（默认：false）
 *   --dry-run        模拟运行，不实际复制文件（默认：false）
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { existsSync } from 'fs'

// ===== 类型定义 =====

interface BeadCatalogEntry {
  id: string
  name: string
  material: string
  shape: 'spline'
  baseColor: string
  sizeMm: number
  weightG: number
  splineUrl: string
  materialConfig?: {
    presetType: string
    metalness?: number
    roughness?: number
    transmission?: number
    ior?: number
  }
  priceCents: number
  isActive: boolean
}

interface GLBMetadata {
  filename: string
  filePath: string
  fileSize: number // bytes
  fileSizeKB: number
  isValidGLB: boolean
  errorMessage?: string
}

interface ImportOptions {
  inputDir: string
  outputDir: string
  catalogFile: string
  copy: boolean
  dryRun: boolean
}

// ===== 工具函数 =====

/**
 * 解析命令行参数
 */
function parseArguments(): ImportOptions {
  const args = process.argv.slice(2)
  const options: ImportOptions = {
    inputDir: '',
    outputDir: './public/models',
    catalogFile: './generated-catalog.json',
    copy: false,
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    switch (arg) {
      case '--input':
      case '-i':
        options.inputDir = args[++i]
        break
      case '--output':
      case '-o':
        options.outputDir = args[++i]
        break
      case '--catalog':
      case '-c':
        options.catalogFile = args[++i]
        break
      case '--copy':
        options.copy = true
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
    }
  }

  return options
}

/**
 * 打印帮助信息
 */
function printHelp() {
  console.log(`
Spline GLB Model Batch Import Tool

使用方法:
  npm run import-models -- --input ./raw-models [选项]

选项:
  --input, -i <dir>     输入目录路径（必需）
  --output, -o <dir>    输出目录路径（默认：./public/models）
  --catalog, -c <file>  生成的catalog文件路径（默认：./generated-catalog.json）
  --copy                复制文件到output目录
  --dry-run             模拟运行，不实际操作文件
  --help, -h            显示此帮助信息

示例:
  # 扫描raw-models目录并生成catalog
  npm run import-models -- --input ./raw-models

  # 扫描并复制文件到public/models
  npm run import-models -- --input ./raw-models --copy

  # 模拟运行（不实际操作）
  npm run import-models -- --input ./raw-models --dry-run
`)
}

/**
 * 验证GLB文件格式
 * GLB文件以 "glTF" 魔术字节开头（0x46546C67）
 */
async function validateGLBFile(filePath: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const buffer = await fs.readFile(filePath)

    // 检查文件大小（至少12字节的header）
    if (buffer.length < 12) {
      return { valid: false, error: 'File too small to be a valid GLB' }
    }

    // 检查GLB魔术字节：0x46546C67 ("glTF")
    const magic = buffer.readUInt32LE(0)
    if (magic !== 0x46546c67) {
      return { valid: false, error: 'Invalid GLB magic bytes (not a GLB file)' }
    }

    // 检查版本（应该是2）
    const version = buffer.readUInt32LE(4)
    if (version !== 2) {
      return { valid: false, error: `Unsupported GLB version: ${version} (expected 2)` }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: `Failed to read file: ${error}` }
  }
}

/**
 * 扫描目录获取所有GLB文件
 */
async function scanGLBFiles(dir: string): Promise<GLBMetadata[]> {
  const files: GLBMetadata[] = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith('.glb') || entry.name.endsWith('.gltf'))) {
        const filePath = path.join(dir, entry.name)
        const stats = await fs.stat(filePath)
        const validation = await validateGLBFile(filePath)

        files.push({
          filename: entry.name,
          filePath,
          fileSize: stats.size,
          fileSizeKB: Math.round(stats.size / 1024),
          isValidGLB: validation.valid,
          errorMessage: validation.error,
        })
      }
    }

    // 递归扫描子目录
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subFiles = await scanGLBFiles(path.join(dir, entry.name))
        files.push(...subFiles)
      }
    }
  } catch (error) {
    console.error(`❌ Failed to scan directory ${dir}:`, error)
  }

  return files
}

/**
 * 根据文件名推断材质类型
 */
function inferMaterialType(filename: string): string {
  const lower = filename.toLowerCase()

  if (lower.includes('glass') || lower.includes('玻璃')) return 'glass'
  if (lower.includes('crystal') || lower.includes('水晶')) return 'crystal'
  if (lower.includes('metal') || lower.includes('金属')) return 'metal'
  if (lower.includes('acrylic') || lower.includes('亚克力')) return 'acrylic'
  if (lower.includes('pearl') || lower.includes('珍珠')) return 'pearl'

  return 'glass' // default
}

/**
 * 根据文件名生成友好的珠子名称
 */
function generateBeadName(filename: string): string {
  // 去除扩展名
  const nameWithoutExt = filename.replace(/\.(glb|gltf)$/i, '')

  // 首字母大写
  return nameWithoutExt
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * 根据材质类型推断默认颜色
 */
function getDefaultColor(material: string): string {
  const colorMap: Record<string, string> = {
    glass: '#63B3FF',      // 天蓝色
    crystal: '#B48CFF',    // 薰衣草紫
    metal: '#FFD700',      // 金色
    acrylic: '#FF6DAF',    // 糖果粉
    pearl: '#FFF8DC',      // 珍珠白
  }

  return colorMap[material] || '#FF6DAF'
}

/**
 * 生成材质配置
 */
function generateMaterialConfig(material: string): any {
  const configMap: Record<string, any> = {
    glass: {
      presetType: 'glass',
      transmission: 0.95,
      ior: 1.5,
    },
    crystal: {
      presetType: 'crystal',
      transmission: 0.98,
      ior: 1.54,
      iridescence: 0.3,
    },
    metal: {
      presetType: 'metal',
      metalness: 1.0,
      roughness: 0.15,
    },
    acrylic: {
      presetType: 'acrylic',
      metalness: 0.1,
      roughness: 0.2,
    },
    pearl: {
      presetType: 'pearl',
      iridescence: 0.7,
    },
  }

  return configMap[material] || { presetType: 'default' }
}

/**
 * 生成Bead Catalog条目
 */
function generateCatalogEntry(
  metadata: GLBMetadata,
  index: number,
  outputDir: string
): BeadCatalogEntry {
  const material = inferMaterialType(metadata.filename)
  const name = generateBeadName(metadata.filename)
  const baseColor = getDefaultColor(material)
  const relativeUrl = path.join('/models', metadata.filename)

  return {
    id: `spline-${index + 1}`,
    name,
    material,
    shape: 'spline',
    baseColor,
    sizeMm: 12, // 默认尺寸，可以手动调整
    weightG: 0.6, // 默认重量，可以手动调整
    splineUrl: relativeUrl,
    materialConfig: generateMaterialConfig(material),
    priceCents: 1000, // 默认价格，可以手动调整
    isActive: true,
  }
}

/**
 * 复制文件到输出目录
 */
async function copyFile(sourcePath: string, destPath: string): Promise<void> {
  const destDir = path.dirname(destPath)

  // 确保目标目录存在
  if (!existsSync(destDir)) {
    await fs.mkdir(destDir, { recursive: true })
  }

  await fs.copyFile(sourcePath, destPath)
}

// ===== 主函数 =====

async function main() {
  console.log('🚀 Spline GLB Batch Import Tool\n')

  // 解析参数
  const options = parseArguments()

  // 验证输入目录
  if (!options.inputDir) {
    console.error('❌ Error: --input directory is required\n')
    printHelp()
    process.exit(1)
  }

  if (!existsSync(options.inputDir)) {
    console.error(`❌ Error: Input directory does not exist: ${options.inputDir}`)
    process.exit(1)
  }

  console.log(`📁 Input directory: ${options.inputDir}`)
  console.log(`📁 Output directory: ${options.outputDir}`)
  console.log(`📄 Catalog file: ${options.catalogFile}`)
  if (options.dryRun) {
    console.log('🔍 Dry run mode: No files will be modified\n')
  }
  console.log('')

  // 扫描GLB文件
  console.log('🔍 Scanning for GLB files...\n')
  const glbFiles = await scanGLBFiles(options.inputDir)

  if (glbFiles.length === 0) {
    console.log('⚠️  No GLB files found in the input directory')
    process.exit(0)
  }

  // 显示发现的文件
  console.log(`✅ Found ${glbFiles.length} GLB file(s):\n`)
  glbFiles.forEach((file, index) => {
    const status = file.isValidGLB ? '✅' : '❌'
    const size = `${file.fileSizeKB}KB`
    console.log(`  ${index + 1}. ${status} ${file.filename} (${size})`)
    if (!file.isValidGLB) {
      console.log(`     ⚠️  ${file.errorMessage}`)
    }
  })
  console.log('')

  // 过滤出有效的GLB文件
  const validFiles = glbFiles.filter((f) => f.isValidGLB)

  if (validFiles.length === 0) {
    console.log('❌ No valid GLB files found')
    process.exit(1)
  }

  // 生成catalog条目
  console.log('📝 Generating catalog entries...\n')
  const catalogEntries = validFiles.map((file, index) =>
    generateCatalogEntry(file, index, options.outputDir)
  )

  // 保存catalog JSON
  if (!options.dryRun) {
    const catalogJson = JSON.stringify(catalogEntries, null, 2)
    await fs.writeFile(options.catalogFile, catalogJson, 'utf-8')
    console.log(`✅ Catalog saved to: ${options.catalogFile}\n`)
  } else {
    console.log('🔍 Dry run: Catalog would be saved to:', options.catalogFile, '\n')
  }

  // 复制文件（如果启用）
  if (options.copy) {
    console.log('📦 Copying files to output directory...\n')

    for (const file of validFiles) {
      const destPath = path.join(options.outputDir, file.filename)

      if (!options.dryRun) {
        await copyFile(file.filePath, destPath)
        console.log(`  ✅ Copied: ${file.filename} -> ${destPath}`)
      } else {
        console.log(`  🔍 Would copy: ${file.filename} -> ${destPath}`)
      }
    }
    console.log('')
  }

  // 显示生成的catalog预览
  console.log('📋 Generated Catalog Preview:\n')
  console.log(JSON.stringify(catalogEntries, null, 2))
  console.log('')

  // 完成提示
  console.log('✨ Import complete!\n')
  console.log('📌 Next steps:')
  console.log(`  1. Review the generated catalog: ${options.catalogFile}`)
  console.log('  2. Adjust properties (name, size, price, etc.) as needed')
  console.log('  3. Copy the catalog entries to your bead catalog in the app')
  if (!options.copy) {
    console.log(`  4. Manually copy GLB files to ${options.outputDir}`)
  }
  console.log('')
}

// 运行主函数
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})