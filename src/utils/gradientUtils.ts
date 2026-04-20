/**
 * Shared gradient utility functions for gradient polyline rendering.
 * Ported from MMGIS's src/essence/Basics/Layers_/gradientUtils.js
 */

/**
 * Interpolate between two colors using RGB.
 */
export function interpolateColor(
    color1: string,
    color2: string,
    factor: number
): string {
    if (!color1 || !color2) return color1 || color2

    factor = Math.max(0, Math.min(1, factor))

    const rgb1 = hexToRgb(color1) || parseRgb(color1)
    const rgb2 = hexToRgb(color2) || parseRgb(color2)

    if (!rgb1 || !rgb2) return color1

    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor)
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor)
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor)

    return `rgb(${r}, ${g}, ${b})`
}

/**
 * Interpolate between multiple colors using color stops.
 */
export function interpolateMultipleColors(
    colorStops: { position: number; color: string }[],
    value: number,
    minValue: number,
    maxValue: number
): string | null {
    if (!colorStops || colorStops.length === 0) return null
    if (colorStops.length === 1) return colorStops[0].color

    const normalizedValue =
        maxValue === minValue ? 0 : (value - minValue) / (maxValue - minValue)

    const clampedValue = Math.max(0, Math.min(1, normalizedValue))

    if (clampedValue === 0) return colorStops[0].color
    if (clampedValue === 1) return colorStops[colorStops.length - 1].color

    for (let i = 0; i < colorStops.length - 1; i++) {
        const currentStop = colorStops[i]
        const nextStop = colorStops[i + 1]

        if (
            clampedValue >= currentStop.position &&
            clampedValue <= nextStop.position
        ) {
            const stopRange = nextStop.position - currentStop.position
            const localFactor =
                stopRange === 0
                    ? 0
                    : (clampedValue - currentStop.position) / stopRange

            return interpolateColor(
                currentStop.color,
                nextStop.color,
                localFactor
            )
        }
    }

    return colorStops[colorStops.length - 1].color
}

/**
 * Build a stepped color ramp from an array of color strings.
 * Returns an array of { position, color } objects normalized from 0 to 1.
 */
export function buildColorStops(
    colorRamp: string[]
): { position: number; color: string }[] {
    if (!colorRamp || colorRamp.length === 0) return []
    if (colorRamp.length === 1)
        return [{ position: 0, color: colorRamp[0] }]

    return colorRamp.map((color, idx) => ({
        position: idx / (colorRamp.length - 1),
        color: color,
    }))
}

/**
 * Convert hex color to RGB. Handles 3-char and 6-char hex.
 */
export function hexToRgb(
    hex: string
): { r: number; g: number; b: number } | null {
    if (!hex || typeof hex !== 'string') return null

    hex = hex.replace('#', '')

    if (hex.length === 3) {
        hex = hex
            .split('')
            .map((char) => char + char)
            .join('')
    }

    if (hex.length !== 6) return null

    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b }
}

/**
 * Parse rgb() color strings to { r, g, b }.
 */
export function parseRgb(
    color: string
): { r: number; g: number; b: number } | null {
    if (!color || typeof color !== 'string') return null

    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return null

    return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
    }
}

/**
 * Find the closest point on line segment [a->b] to point p.
 * Coordinates are treated as flat (lng/lat in degrees).
 */
export function closestPointOnSegment(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number
): { t: number; dist: number } {
    const dx = bx - ax
    const dy = by - ay
    const lenSq = dx * dx + dy * dy
    if (lenSq === 0) {
        return { t: 0, dist: Math.sqrt((px - ax) ** 2 + (py - ay) ** 2) }
    }
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
    t = Math.max(0, Math.min(1, t))
    const cx = ax + t * dx
    const cy = ay + t * dy
    return { t, dist: Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) }
}
