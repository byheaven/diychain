"use client"

import { useRef, useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

interface DraggableControlPointProps {
  position: THREE.Vector3
  index: number
  onDrag: (index: number, newPosition: THREE.Vector3) => void
  isEditing: boolean
}

export function DraggableControlPoint({
  position,
  index,
  onDrag,
  isEditing,
}: DraggableControlPointProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isEditing) return
    e.stopPropagation()
    setIsDragging(true)
    ;(e.target as any).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !isEditing) return
    e.stopPropagation()

    // 获取鼠标在3D空间的位置（限制在桌面平面上，Y 高度固定）
    const newPosition = new THREE.Vector3(
      e.point.x,        // 左右方向可以移动
      position.y,       // 高度保持不变（平放在桌面上）
      e.point.z         // 前后方向可以移动
    )

    onDrag(index, newPosition)
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return
    e.stopPropagation()
    setIsDragging(false)
    ;(e.target as any).releasePointerCapture(e.pointerId)
  }

  if (!isEditing) return null

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation()
        setIsHovered(true)
        document.body.style.cursor = 'grab'
      }}
      onPointerOut={() => {
        setIsHovered(false)
        if (!isDragging) {
          document.body.style.cursor = 'auto'
        }
      }}
    >
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color={isDragging ? '#ff6b6b' : isHovered ? '#4ecdc4' : '#95e1d3'}
        emissive={isDragging ? '#ff6b6b' : isHovered ? '#4ecdc4' : '#000000'}
        emissiveIntensity={isDragging ? 0.5 : isHovered ? 0.3 : 0}
        metalness={0.3}
        roughness={0.4}
      />

      {/* 外圈指示器 */}
      <mesh>
        <ringGeometry args={[0.1, 0.12, 32]} />
        <meshBasicMaterial
          color={isDragging ? '#ff6b6b' : '#ffffff'}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </mesh>
  )
}
