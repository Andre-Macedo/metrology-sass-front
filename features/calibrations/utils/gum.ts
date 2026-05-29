export interface UncertaintySource {
    source: string
    value: number
    distribution: 'Normal' | 'Rectangular' | 'Triangular' | 'U-Shaped'
    divisor: number
    standard_uncertainty: number
}

export const DISTRIBUTIONS = {
    'Normal': 1,
    'Rectangular': Math.sqrt(3), // 1.732...
    'Triangular': Math.sqrt(6), // 2.449...
    'U-Shaped': Math.sqrt(2), // 1.414...
}

export function calculateStandardUncertainty(value: number, distribution: keyof typeof DISTRIBUTIONS): number {
    const divisor = DISTRIBUTIONS[distribution] || 1.732
    return value / divisor
}

export function calculateExpandedUncertainty(sources: UncertaintySource[], k: number = 2): { combined: number, expanded: number } {
    const sumSquares = sources.reduce((acc, source) => acc + Math.pow(source.standard_uncertainty, 2), 0)
    const combined = Math.sqrt(sumSquares)
    const expanded = combined * k
    
    return { combined, expanded }
}
