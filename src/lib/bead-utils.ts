import type { Bead, BeadShape } from '@/types'

// Calculate the "radius" (distance from center to bottom) for each bead shape
export function getBeadRadius(shape: BeadShape): number {
  const size = 0.2

  switch (shape) {
    case 'sphere':
      return size // 0.2
    case 'cube':
      return (size * 1.8) / 2 // 0.18
    case 'cylinder':
      // When laying flat, the radius determines the height
      return size * 0.8 // 0.16
    case 'heart':
      return 0.05 // Half of extrude depth
    case 'star':
      return 0.04 // Half of extrude depth
    case 'flower':
      return size // 0.2
    case 'spline':
      return size * 1.2 // 0.24 - slightly larger for Spline models
    default:
      return size
  }
}

// Calculate the chain height based on the largest bead in the catalog
export function calculateChainHeight(beads: Bead[]): number {
  const MIN_HEIGHT = 0.2 // Minimum chain height

  if (beads.length === 0) {
    return MIN_HEIGHT
  }

  // Find the maximum radius among all beads
  const maxRadius = Math.max(
    ...beads.map((bead) => getBeadRadius(bead.shape)),
    MIN_HEIGHT
  )

  // Add a small margin to ensure beads don't touch the desktop
  return maxRadius + 0.01
}
