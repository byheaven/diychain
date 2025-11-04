import * as THREE from "three"

// Create a heart shape geometry
export function createHeartShape() {
  const shape = new THREE.Shape()
  const x = 0
  const y = 0

  shape.moveTo(x + 0, y + 0.3)
  shape.bezierCurveTo(x + 0, y + 0.3, x - 0.15, y + 0.4, x - 0.15, y + 0.15)
  shape.bezierCurveTo(x - 0.15, y + 0, x - 0.1, y - 0.1, x + 0, y - 0.3)
  shape.bezierCurveTo(x + 0.1, y - 0.1, x + 0.15, y + 0, x + 0.15, y + 0.15)
  shape.bezierCurveTo(x + 0.15, y + 0.4, x + 0, y + 0.3, x + 0, y + 0.3)

  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  }

  return new THREE.ExtrudeGeometry(shape, extrudeSettings)
}

// Create a star shape geometry
export function createStarShape() {
  const shape = new THREE.Shape()
  const outerRadius = 0.2
  const innerRadius = 0.1
  const points = 5

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / points
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (i === 0) {
      shape.moveTo(x, y)
    } else {
      shape.lineTo(x, y)
    }
  }
  shape.closePath()

  const extrudeSettings = {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  }

  return new THREE.ExtrudeGeometry(shape, extrudeSettings)
}
