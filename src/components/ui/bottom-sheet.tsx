"use client"

import { ReactNode, useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "./button"

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevent body scroll when sheet is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0].clientY
    const diff = touch - startY

    // Only allow dragging down
    if (diff > 0) {
      setCurrentY(diff)
    }
  }

  const handleTouchEnd = () => {
    // If dragged down more than 100px, close the sheet
    if (currentY > 100) {
      onClose()
    }
    setCurrentY(0)
    setStartY(0)
  }

  const handleBackdropClick = () => {
    onClose()
  }

  if (!isOpen && !isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl z-50 transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          transform: isOpen ? `translateY(${currentY}px)` : "translateY(100%)",
          maxHeight: "75vh",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(75vh - 80px)" }}>
          {children}
        </div>
      </div>
    </>
  )
}
