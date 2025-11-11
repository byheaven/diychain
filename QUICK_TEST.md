# 🧪 快速测试清单

## 启动开发服务器

开发服务器已在后台运行：
```
✓ http://localhost:3000
```

---

## 🎯 测试步骤

### 1. 打开编辑器
访问：http://localhost:3000/editor

### 2. 测试基础珠子
拖拽以下珠子到画布：
- ✅ 粉色玻璃珠（sphere）
- ✅ 天蓝水晶（sphere）
- ✅ 柠檬黄亚克力（cube）
- ✅ 薰衣草紫珠（heart）
- ✅ 银色星星（star）

**预期：** 正常显示，带阴影和光泽

### 3. 测试 Spline GLB 珠子

#### 3.1 Flow 流动珠（玻璃）
- 拖拽"Flow 流动珠"到画布
- **预期：**
  - ✅ 显示 `/models/flow_4.glb` 的模型
  - ✅ 玻璃透明效果
  - ✅ 高光反射
  - ✅ 自动缩放到合适大小

#### 3.2 复古钥匙（金属）
- 拖拽"复古钥匙"到画布
- **预期：**
  - ✅ 显示 `/models/key.glb` 的模型
  - ✅ 金属质感
  - ✅ 环境反射
  - ✅ 保留原始金色

### 4. 测试 Bloom 发光效果

打开浏览器控制台（F12）：
1. 添加任意珠子
2. 查看日志：
   ```
   [Spline Bead] Material 1: { emissiveIntensity: ... }
   ```
3. 如果 `emissiveIntensity > 0.8`，应该能看到发光边缘

**调整发光：**
- 编辑 `src/components/editor/canvas-3d.tsx`
- 修改 `<Bloom intensity={...} />`

### 5. 测试重置功能
1. 添加几个珠子
2. 点击右上角"重置"按钮
3. 确认对话框
4. **预期：** 所有珠子被清空

### 6. 测试链条样式
1. 点击"链条样式"
2. 切换不同样式：
   - Simple（简单）
   - Braided（编织）
   - Link（链环）
   - Snake（蛇骨）
3. **预期：** 链条外观变化

---

## 🔍 调试工具

### 浏览器控制台
按 F12 打开，查看：
- `[Spline Bead]` 开头的日志
- Material 参数
- 加载进度

### Material Debugger（可选）
按 `Ctrl+M` 打开材质调试面板（仅开发环境）

---

## 🐛 常见问题排查

### 问题 1：珠子不显示
**检查：**
1. 控制台是否有 404 错误？
2. GLB 文件是否在 `public/models/` 目录？
3. `splineUrl` 路径是否正确？

**解决：**
```bash
ls -la public/models/
# 应该看到 flow_4.glb 和 key.glb
```

### 问题 2：材质看起来不对
**检查：**
1. `materialConfig.presetType` 是否正确？
2. `preserveColor` 设置是否符合预期？

**解决：**
打开 Material Debugger (Ctrl+M) 查看实际参数

### 问题 3：没有发光效果
**检查：**
1. 珠子的 `emissiveIntensity` 是否 > 0.8？
2. Bloom 是否启用？

**解决：**
```typescript
// 增加珠子发光
materialConfig: {
  emissiveIntensity: 2.0,
}

// 调整 Bloom 阈值
<Bloom luminanceThreshold={0.7} />
```

### 问题 4：性能不佳
**检查：**
1. 是否有很多相同珠子？
2. 可以使用实例化渲染

**解决：**
使用 `InstancedBead` 组件替代多个 `SplineBeadMesh`

---

## ✅ 验收标准

### 必须通过
- [x] TypeScript 编译无错误
- [x] 开发服务器正常启动
- [ ] 所有珠子类型都能显示
- [ ] 材质效果符合预期
- [ ] Bloom 发光正常工作
- [ ] 重置按钮功能正常

### 建议测试
- [ ] 添加 10+ 珠子，FPS > 30
- [ ] 切换链条样式流畅
- [ ] 拖拽珠子重新排序
- [ ] 保存和加载设计

---

## 📞 如果遇到问题

1. **查看控制台日志**（F12）
2. **检查文件路径**（`public/models/`）
3. **确认 GLB 文件有效**（用在线查看器打开）
4. **参考文档：**
   - `SPLINE_GLB_GUIDE.md` - 导出指南
   - `IMPLEMENTATION_SUMMARY.md` - 实施总结

---

**测试时间：** 2025-11-11  
**状态：** 准备就绪 ✅

