"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun, Save, Share2, RotateCcw } from "lucide-react"
import { useState, useEffect } from "react"
import { useEditorStore } from "@/lib/store"

export function Header() {
  const [isDark, setIsDark] = useState(false)
  const { resetChain } = useEditorStore()

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)

    if (newTheme) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleReset = () => {
    if (window.confirm('确定要重置所有珠子吗？此操作无法撤销。')) {
      resetChain()
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-candy-pink via-sky-blue to-lavender-purple bg-clip-text text-transparent">
              DIY Chain
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button variant="outline" size="icon" className="sm:hidden" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
          <Button variant="outline" size="icon" className="sm:hidden">
            <Save className="h-4 w-4" />
          </Button>

          <Button size="sm" className="hidden sm:inline-flex bg-gradient-to-r from-candy-pink to-sky-blue">
            <Share2 className="h-4 w-4 mr-2" />
            分享
          </Button>
          <Button size="icon" className="sm:hidden bg-gradient-to-r from-candy-pink to-sky-blue">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
