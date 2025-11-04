# 3D手机挂饰链DIY页面产品方案

## Product Description

面向热爱DIY与潮玩风格的女性用户的在线3D手机挂饰链定制页面。用户通过直观的拖放方式，从左侧“水晶珠库”挑选珠子并组合到中间的3D编辑区，实时预览挂饰链效果，完成后可保存、分享与再次编辑，获得创作乐趣与成就感。

* 目标用户

  * 喜爱个性化配饰与手作DIY的女性用户（青少年至年轻职场人群）

  * 潮玩审美、注重光泽与质感、偏好轻松有趣的互动方式

* 关键交互

  * 左侧珠子列表：按材质、形状、颜色、大小筛选与搜索

  * 3D拖放编辑：将珠子拖入编辑区指定位置，支持吸附到链条插槽、预设对齐与顺序调整

  * 属性调节：可在右侧面板调整珠子大小、颜色变体、透明度/光泽度等视觉参数（受材料特性限制）

  * 快速编辑：撤销/重做、批量替换、镜像排列、随机配色建议

  * 视图与相机：旋转/缩放/重置视角，一键切换“平铺视图/佩戴视图”

  * 结果输出：保存为作品，生成可视化预览图与分享链接，支持再次编辑与收藏

* 产品目标

  * 让用户以尽可能低的上手成本完成“第一条个性手机挂饰链”

  * 提供顺滑、沉浸、稳定的3D创作体验

  * 形成以作品为核心的分享与回访闭环，促进UGC内容沉淀与二次创作

## Deisgn and Theme

页面整体风格可爱、潮玩、年轻化，强调“光泽、圆润、通透”的材质表现，支持浅色/深色模式自适应。

* 设计框架与组件

  * UI组件：shadcn/ui（与Tailwind CSS深度集成）、Radix Primitives交互基础

  * 样式系统：Tailwind CSS，支持主题变量与暗黑模式切换

* 色彩与主题

  * 主色：糖果粉 #FF6DAF、天空蓝 #63B3FF、柠檬黄 #FFD66D

  * 辅色：薰衣草紫 #B48CFF、薄荷绿 #78E3C5、中性色 #1F2937（深）、#F9FAFB（浅）

  * 暗色模式：降低纯度、提升对比度，保持珠子高光与边缘描边清晰

* 字体与图形语言

  * 字体：无衬线、圆角字重（如 Inter / HarmonyOS Sans）

  * 图标：线性与填充混合，圆角统一；动效采用弹性曲线、微缩放与发光脉冲

* 3D风格落地

  * 珠子材质：玻璃/水晶（高透明+环境映射）、不透明亚克力（高光泽）、金属配件（暖金/冷银）

  * 表面特征：圆润倒角、软阴影、柔和高光；适度泛光与屏幕后期特效增强通透感

* 动效与反馈

  * 拖放吸附与磁性指示，成功落点微弹跳

  * 保存成功→绚丽粒子/彩纸、3D转台预览

  * 状态切换（亮/暗）支持环境光过渡与高光强度平衡

## Required Development Stack

为保证可维护性与高性能，优先推荐以下技术栈：

* 前端

  * 框架：Next.js 14（App Router，TypeScript，React 18）

  * 3D与交互：Three.js + React Three Fiber + @react-three/drei

  * 状态管理：Zustand（轻量、可持久化）+ URL 查询串同步

  * 表单与校验：React Hook Form + Zod

  * 样式：Tailwind CSS + shadcn/ui（支持暗黑、主题化）

  * 媒体处理：Next/Image（响应式与lazy加载）

  * 性能：KTX2纹理压缩、Draco压缩网格、实例化渲染、请求分片与并行加载

* 替代方案（如强调轻量）

  * Vite + React + R3F + TanStack Router

* 工具与部署

  * 打包与托管：Vercel（或Netlify），CDN加速3D资产

  * 质量保证：ESLint、Prettier、TypeCheck、Playwright（端到端）、Vitest/Jest（单元）

  * 分析与埋点：PostHog 或 Vercel Analytics

  * 错误监控：Sentry

## Application Backend Requirements

满足账号体系、作品存储、分享与收藏等核心能力，兼顾扩展性与安全性。

* 认证与用户

  * 认证：Auth.js（Email/Password、OAuth：Google/Apple/微博/微信）或 Clerk（托管型）

  * 会话：JWT/数据库会话，支持无痕浏览→登录后合并草稿

* 数据与存储

  * 数据库：Supabase（Postgres，含行级安全）或 Neon（Serverless Postgres）

  * ORM：Drizzle（推荐，类型安全与迁移简单）或 Prisma

  * 文件/对象存储：Supabase Storage 或 S3 兼容桶，用于作品封面图、快照图

* 数据表建议

  * users

    * id, email, nickname, avatar_url, created_at

  * bead_catalog（珠子目录）

    * id, name, material, shape, base_color, size_mm, weight_g, texture_url, normal_map_url, price_cents, is_active, created_at

  * designs（作品主表，满足“主表含用户ID、结构、时间戳和分享链接”要求）

    * id, user_id, title, chain_structure_json, preview_image_url, is_public, share_slug, created_at, updated_at

      * chain_structure_json：包含珠子序列、各珠子属性（id、颜色变体、缩放、顺序、分隔件、挂点）及相机/光照快照

  * favorites（收藏）

    * id, user_id, design_id, created_at

  * views（浏览日志，可选）

    * id, design_id, viewer_id/null, user_agent, created_at

* API端点（可采用Next.js Route Handlers）

  * POST /api/auth/callback（Auth.js/Clerk回调）

  * GET /api/beads（分页/筛选）

  * POST /api/designs（创建）/ GET /api/designs/:id（读取）

  * PATCH /api/designs/:id（更新，权限校验）

  * POST /api/designs/:id/publish（生成share_slug并设为公开）

  * POST /api/designs/:id/favorite / DELETE /api/designs/:id/favorite

  * GET /api/share/:slug（公开读取）

* 安全与权限

  * 行级安全策略（RLS）：设计仅作者可写，公开作品可读

  * 速率限制：基于IP与用户ID，防滥用分享接口

  * 输入校验：Zod服务端校验，限制结构体大小与复杂度

* 性能与成本

  * 热门作品与珠子目录启用缓存（CDN + SWR）

  * 图片与3D资产通过CDN分发，按需与懒加载

数据结构示例（核心字段）

* designs.chain_structure_json

  * version, camera, lighting, chain_meta（长度、挂点间距、最大珠子数）

  * beads: \[ { catalog_id, color_variant, scale, rotation, position_index, custom_tint, metalness, roughness } \]

## Explicitly Defined Product Flows

为保障用户顺畅体验与“首个获胜时刻（I Win）”，定义以下核心流程。

1. 首访与上手

  * 打开页面即见可交互Demo链条与精选珠子

  * 轻引导：顶部提示“拖拽任意珠子到中间链条试试”

  * 游客可编辑，保存/分享时提示登录

2. 选择与拖放

  * 左侧列表筛选：材质、形状、颜色、大小、价格

  * 将珠子拖入3D编辑区，落点吸附到最近插槽；插槽高亮、占位提示

  * 冲突与约束：超长或重量超限给出提示与自动均匀化建议

3. 调整与微调

  * 编辑面板：颜色变体、大小、透明度/光泽度（受材质约束）、分隔件插入

  * 顺序调整：3D中直接拖动或在“串珠时间轴”列表拖动；支持撤销/重做

  * 视图切换：平铺视图（检视排列）与佩戴视图（真实垂挂姿态预览）

4. 保存与反馈

  * 点击保存：生成封面图（自动捕捉最优角度）、存储结构数据、返回“保存成功”动画与动效音

  * 登录后自动创建分享链接；未登录弹窗引导（登录后自动重试保存）

5. 分享与再编辑

  * 分享链接/二维码、复制按钮；公开页含“点赞/收藏/再创作（Remix）”

  * 再创作：从公开作品一键导入为自己的草稿（标注来源）

6. 收藏与浏览

  * 个人中心：我的作品、我的收藏、浏览记录

  * 作品卡片：封面、标题、材质标签、时间、热度

7. 首个“I Win”时刻设计

  * 完成第一条挂饰链并保存后：3D转台演示+彩纸动画+“去分享”CTA

  * 引导文案：已生成专属分享链接，支持再次编辑与一键下单（如后续接入电商）

异常与边界处理

* 拖放失败/插槽已满：震动反馈与文案提示

* 网络波动：离线草稿缓存，恢复后自动同步

* 设备性能不足：自动降级特效（关闭后期处理、降低采样）

## Explicit Directions for AI Generation

为AI代码生成平台提供明确边界、模块拆分、性能指标与验收标准，确保一次生成可运行的MVP。

* 页面与路由

  * /（首页+编辑器）

  * /gallery（公开作品瀑布流）

  * /design/:id（我的作品详情/编辑）

  * /share/:slug（公开只读页）

  * /auth（登录/注册/回调）

  * /profile（我的作品/收藏）

* 组件清单（按功能域）

  * 左侧：BeadFilterBar、BeadList、BeadCard

  * 中间：Canvas3D（R3F场景）、ChainEditor、SlotGizmo、ViewportToolbar、ScreenshotButton

  * 右侧：PropertyPanel（颜色/大小/材质受限控件）、LayerTimeline（顺序/分组）

  * 全局：Header、ThemeToggle、AuthDialog、Toast、ConfettiOverlay、ShareModal

* 3D场景设定（建议默认）

  * 相机：透视相机 FOV 35–45，初始距模型1.8–2.2m，轨道控制（限制极角）

  * 光照：一盏主定向光+环境光+HDR环境贴图（室内柔光），开启接触阴影

  * 材质：PBR参数可配置；玻璃类使用物理透明与折射（移动端自动降级为简化透明）

  * 后期：Bloom（微量）、色调映射、Gamma校正；移动端可关闭Bloom

  * 性能：实例化相同珠子网格；启用KTX2纹理、Draco压缩；Raycasting用于拖放与选中

* 拖放与插槽逻辑

  * 插槽等距分布于链条样条曲线（spline），每个插槽有唯一position_index

  * 拖入时进行合法性校验（尺寸/重量/相邻冲突）；失败给出原因与可用替代建议

  * 顺序调整支持在时间轴与3D视图双向同步；撤销/重做采用操作栈

* 数据与配置

  * 珠子目录由后端分页提供，字段：id、name、material、shape、base_color、size_mm、weight_g、texture/normal、price_cents、is_active

  * 作品结构使用chain_structure_json统一描述，包含：version、beads\[\]、camera、lighting、chain_meta

  * 配置化参数：最大珠子数、默认链长、插槽密度、材质可调参数范围、性能降级阈值

* 非功能要求与兼容性

  * 性能目标：桌面与中高端移动端60 FPS，低端机≥30 FPS

  * 包体预算：首屏≤300KB JS（gzip）+ 必要3D资产按需加载；TTI < 3s（4G网络中位）

  * 兼容：Chrome、Safari、Firefox、Edge最新版；iOS 15+，Android 10+

  * 可访问性：键盘操作插槽移动、ARIA提示、对比度达标；动画尊重“减少动态”系统设置

  * 国际化：i18n准备（zh-CN为默认，en可后续接入）

* 安全与隐私

  * 分享页仅公开必要字段；私有作品需权限校验

  * 上传与存储启用类型与大小校验；RLS策略就绪

* 构建与部署参数

  * 环境变量

    * AUTH_SECRET, AUTH_GOOGLE_ID/SECRET（或Clerk密钥）

    * DATABASE_URL（Supabase/Neon）

    * STORAGE_BUCKET、PUBLIC_CDN_BASE

    * NEXT_PUBLIC_ANALYTICS_KEY

  * 构建优化：按路由与组件拆分；3D相关包仅在含Canvas的路由加载

* 验收标准（MVP）

  * 用户可在首页完成：挑选珠子→拖放→调整顺序→保存→生成分享链接全流程

  * 3D交互顺滑无明显卡顿；移动端交互可用（触控拖放/缩放）

  * 作品主表包含用户ID、结构JSON、时间戳、分享链接；公开页可浏览与收藏

  * 错误与空态均有合理提示；暗黑模式与主题切换生效

* 扩展与未来规划（为AI保留接口）

  * 物理模拟（绳索轻摆）、多串并联、挂件与字母珠、AI配色推荐与一键生成

  * 电商对接：价格估算、下单、库存校验与物流查询