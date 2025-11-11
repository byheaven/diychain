# Spline GLB 导出最佳实践指南

## 📋 概述

本指南介绍如何从 Spline 导出 GLB 格式的珠子，并在 DIY Chain 项目中获得最佳渲染效果。

**新方案优势：**
- ✅ 更好的性能（GLB 比 .splinecode 轻量）
- ✅ 完全控制材质和光照
- ✅ 支持实例化渲染（多颗相同珠子）
- ✅ 兼容所有浏览器
- ✅ 支持 Bloom 发光效果

---

## 🎨 第一步：在 Spline 中准备模型

### 1.1 使用 PBR 材质

在 Spline 编辑器中：

1. **选择你的珠子模型**
2. **右侧面板 → Material → 选择 "Physical"**
3. **配置材质参数：**
   ```
   Color: 你的珠子颜色
   Metalness: 0-1 (金属珠用 1.0，玻璃珠用 0)
   Roughness: 0-1 (越小越光滑)
   Emissive: 自发光颜色（会在 GLB 中保留）
   Transmission: 透明度（玻璃效果）
   ```

### 1.2 关键材质配置示例

#### 玻璃珠
```
Metalness: 0
Roughness: 0.05
Transmission: 0.9
Opacity: 0.3
```

#### 金属珠
```
Metalness: 1.0
Roughness: 0.15
Emissive: 轻微发光（可选）
```

#### 水晶珠
```
Metalness: 0
Roughness: 0.02
Transmission: 0.98
Opacity: 0.25
```

### 1.3 添加自发光（Emissive）

如果需要珠子发光边缘：
1. **Material → Emissive Color**：选择发光颜色
2. **Emissive Intensity**：设置为 0.5 - 2.0
3. 导出后配合 Bloom 后处理会有完美的发光效果

---

## 📁 第二步：导出 GLB

### 2.1 导出设置

1. **点击右上角 Export 按钮**
2. **选择 GLB 格式**
3. **重要：勾选以下选项**
   ```
   ✅ Include Materials（包含材质）
   ✅ Include Textures（包含纹理）
   ✅ Draco Compression（压缩，推荐）
   ```
4. **下载文件**

### 2.2 文件命名规范

推荐命名格式：
```
glass-bead-pink.glb      # 玻璃珠-粉色
metal-key-gold.glb       # 金属钥匙-金色
crystal-star-purple.glb  # 水晶星星-紫色
```

### 2.3 文件大小优化

**目标：** < 200KB per GLB

**优化方法：**
1. 启用 Draco Compression（可减少 70-90%）
2. 优化纹理尺寸（建议 512x512 或 1024x1024）
3. 减少多边形数量（珠子 < 5000 三角形）
4. 移除不必要的动画数据

---

## 📦 第三步：集成到项目

### 3.1 放置文件

```bash
# 将 GLB 文件复制到 public/models/
cp ~/Downloads/glass-bead-pink.glb public/models/
```

### 3.2 更新珠子配置

编辑 `src/app/editor/page.tsx`，添加珠子条目：

```typescript
{
  id: "12",
  name: "粉色玻璃珠",
  material: "glass",
  shape: "spline",
  baseColor: "#FF6DAF",
  sizeMm: 12,
  weightG: 0.6,
  splineUrl: "/models/glass-bead-pink.glb",  // GLB 文件路径
  materialConfig: {
    presetType: "glass",      // 材质预设类型
    transmission: 0.95,       // 透射度
    ior: 1.5,                 // 折射率
    roughness: 0.05,          // 粗糙度
    preserveColor: false,     // 使用 baseColor 覆盖
  },
  priceCents: 1000,
  isActive: true,
  createdAt: new Date().toISOString(),
}
```

### 3.3 材质配置说明

**preserveColor 参数：**
- `true`：保留 GLB 中的原始颜色（推荐用于金属珠）
- `false`：使用 `baseColor` 覆盖（推荐用于可换色的珠子）

**常用预设：**
- `glass` - 玻璃珠
- `crystal` - 水晶珠
- `metal` - 金属珠
- `acrylic` - 亚克力珠
- `pearl` - 珍珠
- `resin` - 树脂

---

## ✨ 第四步：发光效果配置

### 4.1 在 Spline 中设置 Emissive

```
Material → Emissive Color: #FFD700
Material → Emissive Intensity: 1.5
```

### 4.2 Bloom 后处理

项目已配置 Bloom 效果（`src/components/editor/canvas-3d.tsx`）：

```typescript
<Bloom
  intensity={0.5}          // 发光强度
  luminanceThreshold={0.9} // 亮度阈值（只有很亮的部分发光）
  luminanceSmoothing={0.9} // 平滑过渡
  height={300}            // 渲染分辨率
/>
```

**调整发光效果：**
- `intensity`: 增加值让发光更强
- `luminanceThreshold`: 降低值让更多物体发光
- 珠子的 `emissiveIntensity` 需要 > 0.8 才会触发 Bloom

---

## 🚀 性能优化：实例化渲染

### 5.1 何时使用实例化

当链条上有**多个相同珠子**时，使用实例化渲染可以大幅提升性能：

```typescript
// 不用实例化：10 个相同珠子 = 10 次 draw call
// 使用实例化：10 个相同珠子 = 1 次 draw call
```

### 5.2 使用 InstancedBead 组件

```typescript
import { InstancedBead } from "@/components/editor/instanced-bead"

// 收集所有使用相同 GLB 的珠子位置
const sameBeadPositions = chainStructure.beads
  .filter(b => b.catalogId === 'glass-bead-1')
  .map(b => getPosition(b))

// 渲染实例化珠子
<InstancedBead
  glbUrl="/models/glass-bead-pink.glb"
  positions={sameBeadPositions}
  rotations={rotations}
  scales={scales}
  materialPreset="glass"
  baseColor="#FF6DAF"
/>
```

---

## 🎯 完整示例

### 示例 1：玻璃珠（带发光）

**Spline 设置：**
```
Shape: Sphere with details
Material: Physical
  - Color: #FF6DAF (粉色)
  - Metalness: 0
  - Roughness: 0.05
  - Transmission: 0.9
  - Emissive: #FF6DAF
  - Emissive Intensity: 1.2
```

**导出：** `glass-bead-pink.glb`

**Catalog 配置：**
```typescript
{
  id: "glass-1",
  name: "梦幻玻璃珠",
  material: "glass",
  shape: "spline",
  baseColor: "#FF6DAF",
  splineUrl: "/models/glass-bead-pink.glb",
  materialConfig: {
    presetType: "glass",
    transmission: 0.95,
    ior: 1.5,
    emissiveIntensity: 1.2,  // 触发 Bloom
  },
}
```

### 示例 2：金属钥匙（保留原色）

**Spline 设置：**
```
Material: Physical
  - Color: #C9B037 (古铜色)
  - Metalness: 1.0
  - Roughness: 0.3
  - Environment: Studio
```

**导出：** `metal-key-gold.glb`

**Catalog 配置：**
```typescript
{
  id: "key-1",
  name: "复古钥匙",
  material: "metal-gold",
  shape: "spline",
  baseColor: "#C9B037",
  splineUrl: "/models/metal-key-gold.glb",
  materialConfig: {
    presetType: "metal",
    metalness: 1.0,
    roughness: 0.3,
    envMapIntensity: 2.0,
    preserveColor: true,  // 保留 GLB 金色
  },
}
```

---

## 🔧 常见问题

### ❓ 珠子太大或太小？

GLB 会自动缩放到 0.4 单位。如果需要调整：

编辑 `src/components/editor/spline-bead-mesh.tsx` 第 117 行：
```typescript
const targetSize = 0.4  // 改为 0.3（更小）或 0.6（更大）
```

### ❓ 材质看起来不对？

1. 检查 Spline 导出时是否勾选了 "Include Materials"
2. 尝试调整 `materialConfig` 参数
3. 使用 Material Debugger（Ctrl+M）查看实际材质参数
4. 设置 `preserveColor: true` 保留原始颜色

### ❓ 发光效果不明显？

1. **增加 emissiveIntensity：**
   ```typescript
   materialConfig: {
     emissiveIntensity: 2.0,  // 增加到 2.0 或更高
   }
   ```

2. **调整 Bloom 阈值：**
   编辑 `src/components/editor/canvas-3d.tsx`：
   ```typescript
   <Bloom
     intensity={0.8}            // 增加强度
     luminanceThreshold={0.7}   // 降低阈值
   />
   ```

### ❓ 如何批量导入多个 GLB？

使用项目提供的导入工具：

```bash
# 1. 将所有 GLB 放到一个文件夹
mkdir raw-models
cp ~/Downloads/*.glb raw-models/

# 2. 运行导入脚本
npm run import-models -- --input ./raw-models --copy

# 3. 查看生成的配置
cat generated-catalog.json

# 4. 复制到 src/app/editor/page.tsx
```

---

## 📊 性能对比

| 方案 | 单珠子渲染时间 | 10 个相同珠子 | 文件大小 | 材质保真度 |
|------|--------------|-------------|---------|-----------|
| .splinecode | ~50ms | ~500ms | 500KB+ | 100% |
| GLB + 材质映射 | ~10ms | ~100ms | 50-200KB | 95% |
| GLB + 实例化 | ~10ms | ~15ms | 50-200KB | 95% |

**推荐：** GLB + 实例化渲染

---

## 🎉 完整工作流程

### 设计师工作流

1. **Spline 中设计珠子**
   - 使用 Physical Material
   - 配置 Metalness、Roughness、Emissive
   - 预览效果

2. **导出 GLB**
   - Export → GLB
   - 勾选 Materials + Textures + Draco
   - 下载文件

3. **提供给开发**
   - GLB 文件
   - 材质类型（glass/metal/crystal）
   - 期望颜色

### 开发集成流程

1. **放置文件**
   ```bash
   cp bead.glb public/models/
   ```

2. **更新 catalog**
   ```typescript
   // src/app/editor/page.tsx
   {
     id: "new-bead",
     name: "新珠子",
     material: "glass",
     shape: "spline",
     baseColor: "#FF6DAF",
     splineUrl: "/models/bead.glb",
     materialConfig: {
       presetType: "glass",
       // ... 材质参数
     },
   }
   ```

3. **测试**
   - 运行 `npm run dev`
   - 访问 http://localhost:3000/editor
   - 拖拽珠子到画布

---

## 🆚 对比：GLB vs Code Export

### 使用 GLB 的场景（推荐）

✅ 需要可换色的珠子
✅ 多颗相同珠子（实例化优化）
✅ 需要精确控制材质
✅ 性能优先
✅ 移动端兼容性

### 使用 Code Export 的场景

❌ 已弃用 - 存在以下问题：
- 性能开销大
- 无法克隆场景对象
- CORS 限制
- 不支持材质自定义
- 文件体积大

---

## 📚 参考资料

- **Three.js PBR 材质**：https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial
- **Spline 导出指南**：https://docs.spline.design/d2fa187e82e344c0aae81ad99565ee13
- **glTF 规范**：https://www.khronos.org/gltf/

---

**更新时间：** 2025-11-11  
**版本：** 2.0 (GLB-only)

