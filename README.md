# DIY Chain - 3D手机挂饰链定制平台

Make your bracelets or bag chains with our interactive 3D editor.

## 🎨 Features

- **3D Real-time Editor**: Drag and drop beads onto a 3D chain with real-time preview
- **Material Variety**: Glass, crystal, acrylic, metal beads with realistic rendering
- **Customization**: Adjust size, color, metalness, and roughness for each bead
- **Dark Mode**: Beautiful light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
diychain/
├── src/
│   ├── app/              # Next.js 14 App Router pages
│   │   ├── page.tsx      # Landing page
│   │   ├── editor/       # Main editor page
│   │   └── gallery/      # Gallery page (coming soon)
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/       # Header, Footer
│   │   ├── bead/         # Bead catalog components
│   │   ├── editor/       # 3D editor components
│   │   └── share/        # Share functionality (coming soon)
│   ├── lib/
│   │   ├── store.ts      # Zustand state management
│   │   └── utils.ts      # Utility functions
│   └── types/
│       └── index.ts      # TypeScript type definitions
├── public/               # Static assets
└── CLAUDE.md            # AI assistant context

```

## 🎯 Current Status - MVP Phase 1 ✅

### Completed
- ✅ Project setup with Next.js 14, TypeScript, Tailwind CSS
- ✅ 3D rendering with Three.js and React Three Fiber
- ✅ Zustand state management with undo/redo
- ✅ Bead catalog with filtering (material, shape)
- ✅ Drag-and-drop functionality
- ✅ 3D chain editor with slot system
- ✅ Property panel for bead customization
- ✅ Theme toggle (light/dark mode)
- ✅ Responsive layout

### In Progress
- 🔨 Undo/Redo UI controls
- 🔨 Layer timeline component

### Coming Soon
- 📅 Supabase backend integration
- 📅 User authentication
- 📅 Save & share functionality
- 📅 Public gallery
- 📅 API endpoints for designs

## 🎮 How to Use

1. Visit the **Editor** page
2. **Select beads** from the left panel
3. **Drag and drop** beads onto the 3D canvas
4. **Click on beads** in the 3D view to select and edit
5. **Adjust properties** in the right panel:
   - Size (scale)
   - Color tint
   - Metalness
   - Roughness
6. Use **Header buttons** to save or share your design (coming soon)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **3D**: Three.js + React Three Fiber + @react-three/drei
- **State**: Zustand
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Database**: Supabase (planned)
- **Auth**: Auth.js or Clerk (planned)

## 📝 Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript compiler check
```

## 🎨 Design System

### Brand Colors
- Candy Pink: `#FF6DAF`
- Sky Blue: `#63B3FF`
- Lemon Yellow: `#FFD66D`
- Lavender Purple: `#B48CFF`
- Mint Green: `#78E3C5`

## 📚 Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed architecture and development guidelines.

See [PRD.md](./PRD.md) for complete product requirements (Chinese).

## 🤝 Contributing

This is an early-stage MVP. Contributions are welcome!

## 📄 License

MIT
