import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-gradient-to-br from-candy-pink/10 via-sky-blue/10 to-lavender-purple/10">
      <div className="text-center space-y-4 sm:space-y-6 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-candy-pink via-sky-blue to-lavender-purple bg-clip-text text-transparent">
          DIY Chain
        </h1>
        <p className="text-xl sm:text-2xl text-foreground font-medium">
          3D手机挂饰链定制平台
        </p>
        <p className="text-base sm:text-lg text-muted-foreground px-4">
          拖放设计你的专属挂饰链，实时3D预览，一键分享创作
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6 sm:pt-8 px-4">
          <Link href="/editor" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-candy-pink to-sky-blue text-base sm:text-lg px-6 sm:px-8">
              开始创作
            </Button>
          </Link>
          <Link href="/gallery" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8">
              浏览作品
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-8 sm:pt-12 text-sm px-4">
          <div className="p-4 rounded-lg bg-card border">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="font-semibold mb-1">自由创作</h3>
            <p className="text-muted-foreground text-xs">拖放珠子，实时3D预览</p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-semibold mb-1">材质多样</h3>
            <p className="text-muted-foreground text-xs">玻璃、水晶、金属等材质</p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <div className="text-3xl mb-2">🔗</div>
            <h3 className="font-semibold mb-1">一键分享</h3>
            <p className="text-muted-foreground text-xs">生成链接，分享你的创作</p>
          </div>
        </div>
      </div>
    </main>
  )
}
