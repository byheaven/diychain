# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DIY Chain is a 3D phone charm/bracelet customization web application targeting female users who love DIY and trendy accessories. Users drag and drop beads from a catalog into a 3D editor to create custom charm chains, with real-time 3D preview, save, share, and remix functionality.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router, TypeScript, React 18)
- **3D Rendering**: Three.js + React Three Fiber + @react-three/drei
- **State Management**: Zustand (lightweight, persistable) + URL query sync
- **Forms & Validation**: React Hook Form + Zod
- **Styling**: Tailwind CSS + shadcn/ui (supports dark mode and theming)
- **Media**: Next/Image for responsive and lazy loading
- **Performance**: KTX2 texture compression, Draco mesh compression, instanced rendering

### Backend & Infrastructure
- **Authentication**: Auth.js (Email/Password, OAuth: Google/Apple/Weibo/WeChat) or Clerk (managed)
- **Database**: Supabase (Postgres with RLS) or Neon (Serverless Postgres)
- **ORM**: Drizzle (type-safe, simple migrations) or Prisma
- **Storage**: Supabase Storage or S3-compatible bucket for preview images and snapshots
- **Deployment**: Vercel or Netlify with CDN for 3D assets
- **Quality**: ESLint, Prettier, TypeCheck, Playwright (E2E), Vitest/Jest (unit)
- **Analytics**: PostHog or Vercel Analytics
- **Error Monitoring**: Sentry

## Database Schema

### Core Tables
```sql
-- users: user accounts
id, email, nickname, avatar_url, created_at

-- bead_catalog: bead inventory
id, name, material, shape, base_color, size_mm, weight_g,
texture_url, normal_map_url, price_cents, is_active, created_at

-- designs: user creations (contains user_id, structure, timestamps, share link)
id, user_id, title, chain_structure_json, preview_image_url,
is_public, share_slug, created_at, updated_at

-- favorites: saved designs
id, user_id, design_id, created_at

-- views: browsing logs (optional)
id, design_id, viewer_id, user_agent, created_at
```

### chain_structure_json Format
```json
{
  "version": "1.0",
  "camera": {...},
  "lighting": {...},
  "chain_meta": {
    "length": 200,
    "max_beads": 50,
    "slot_spacing": 4
  },
  "beads": [
    {
      "catalog_id": "...",
      "color_variant": "#...",
      "scale": 1.0,
      "rotation": [0, 0, 0],
      "position_index": 0,
      "custom_tint": null,
      "metalness": 0.8,
      "roughness": 0.2
    }
  ]
}
```

## API Endpoints (Next.js Route Handlers)

- `POST /api/auth/callback` - Auth.js/Clerk callback
- `GET /api/beads` - Paginated bead catalog with filters
- `POST /api/designs` - Create new design
- `GET /api/designs/:id` - Read design (with permission check)
- `PATCH /api/designs/:id` - Update design (author only)
- `POST /api/designs/:id/publish` - Generate share_slug and set public
- `POST /api/designs/:id/favorite` - Add to favorites
- `DELETE /api/designs/:id/favorite` - Remove from favorites
- `GET /api/share/:slug` - Public read-only access

## Component Architecture

### Left Panel
- `BeadFilterBar` - Material, shape, color, size, price filters
- `BeadList` - Scrollable bead grid with lazy loading
- `BeadCard` - Individual bead thumbnail with hover preview

### Center Canvas
- `Canvas3D` - R3F scene container
- `ChainEditor` - Main 3D editing area with slot system
- `SlotGizmo` - Visual slot indicators with snap feedback
- `ViewportToolbar` - Rotate, zoom, reset, view toggle (flat/worn)
- `ScreenshotButton` - Capture optimal angle for preview

### Right Panel
- `PropertyPanel` - Color variants, size, transparency, glossiness (material-constrained)
- `LayerTimeline` - Bead sequence with drag-to-reorder, undo/redo

### Global Components
- `Header`, `ThemeToggle`, `AuthDialog`, `Toast`, `ConfettiOverlay`, `ShareModal`

## 3D Scene Configuration

### Camera & Lighting
- Perspective camera: FOV 35-45, distance 1.8-2.2m from model
- Orbit controls with polar angle limits
- One directional light + ambient light + HDR environment map (soft indoor)
- Contact shadows enabled

### Materials & Performance
- PBR materials with configurable parameters
- Glass/crystal: physical transparency + refraction (mobile: simplified transparency)
- Post-processing: Bloom (subtle), tone mapping, gamma correction (Bloom disabled on mobile)
- Instanced rendering for identical beads
- KTX2 textures + Draco compression
- Raycasting for drag-drop and selection

### Drag-Drop Logic
- Slots are evenly distributed along chain spline curve
- Each slot has unique `position_index`
- Validation on drop: size/weight/adjacent conflict checks
- Failed drops show reason + alternative suggestions
- Timeline and 3D view sync bidirectionally
- Undo/redo with operation stack

## Design System

### Theme Colors
- **Primary**: Candy Pink #FF6DAF, Sky Blue #63B3FF, Lemon Yellow #FFD66D
- **Secondary**: Lavender Purple #B48CFF, Mint Green #78E3C5
- **Neutral**: Dark #1F2937, Light #F9FAFB
- **Dark Mode**: Reduced saturation, increased contrast, maintain bead highlights and edge outlines

### Typography & Icons
- Sans-serif rounded fonts (Inter / HarmonyOS Sans)
- Mixed linear/filled icons with rounded corners
- Animations: elastic curves, micro-scaling, glow pulses

### Material Visual Style
- Glass/crystal: high transparency + environment mapping
- Opaque acrylic: high gloss
- Metal accents: warm gold/cool silver
- Rounded bevels, soft shadows, gentle highlights
- Moderate bloom + screen post-effects for translucency

## Performance Targets

- **Desktop & mid-high mobile**: 60 FPS
- **Low-end devices**: ≥30 FPS
- **Bundle size**: First screen ≤300KB JS (gzipped), on-demand 3D asset loading
- **TTI**: <3s on median 4G network
- **Compatibility**: Chrome, Safari, Firefox, Edge (latest), iOS 15+, Android 10+

## User Flows

### First Visit
1. See interactive demo chain with curated beads
2. Top hint: "Drag any bead to the center chain"
3. Guests can edit; login prompt on save/share

### Create & Edit
1. Filter beads (left panel): material, shape, color, size, price
2. Drag bead into 3D editor → snaps to nearest slot with highlight
3. Adjust properties (right panel): color variant, size, transparency, separator insertion
4. Reorder via 3D drag or timeline list
5. Toggle view: flat (inspect layout) vs. worn (realistic drape preview)

### Save & Share
1. Click save → auto-capture optimal angle, store structure, show success animation
2. Logged-in: auto-generate share link
3. Not logged-in: prompt login, retry save after auth
4. Share link/QR code; public page has like/favorite/remix buttons

### Remix & Browse
- Remix: one-click import public design as own draft (attribution)
- Profile: my designs, favorites, view history
- Design cards: preview, title, material tags, timestamp, engagement

### "I Win" Moment
- First saved design: 3D turntable demo + confetti animation + "Share Now" CTA
- Copy message: "Shareable link generated, editable anytime, one-click order (future)"

## Environment Variables

```bash
# Authentication
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
# or use Clerk keys

# Database
DATABASE_URL=

# Storage
STORAGE_BUCKET=
PUBLIC_CDN_BASE=

# Analytics
NEXT_PUBLIC_ANALYTICS_KEY=
```

## Security & Permissions

- Row-Level Security (RLS): designs writable only by author, public designs readable
- Rate limiting: IP + user ID based, prevent share endpoint abuse
- Input validation: Zod server-side validation, limit structure size and complexity
- Share pages expose only necessary fields; private designs require permission check
- Upload/storage: type and size validation

## Internationalization

- i18n ready (zh-CN default, en for future expansion)

## Accessibility

- Keyboard navigation for slot movement
- ARIA labels and hints
- Contrast ratio compliance
- Respect "reduce motion" system preference

## Future Extensibility

- Physics simulation (rope swing)
- Multi-strand parallel chains
- Charms and letter beads
- AI color suggestions and one-click generation
- E-commerce integration: price estimate, ordering, inventory, logistics
