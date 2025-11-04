import { Header } from "@/components/layout/header"

export default function GalleryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">作品画廊</h1>
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">作品画廊功能开发中...</p>
          <p className="text-sm mt-2">即将展示社区创作的精彩挂饰链作品</p>
        </div>
      </main>
    </div>
  )
}
