import { describe, it, expect } from 'vitest'
import { calculateStandardUncertainty, calculateExpandedUncertainty, UncertaintySource } from './gum'

describe('GUM Uncertainty Calculations', () => {
    it('calculates standard uncertainty for Rectangular distribution', () => {
        const val = 0.01
        // sqrt(3) is approx 1.73205
        const result = calculateStandardUncertainty(val, 'Rectangular')
        expect(result).toBeCloseTo(0.0057735, 5)
    })

    it('calculates standard uncertainty for Normal distribution (k=1)', () => {
        const val = 0.005
        const result = calculateStandardUncertainty(val, 'Normal')
        expect(result).toBe(0.005)
    })

    it('calculates expanded uncertainty from multiple sources', () => {
        const sources: UncertaintySource[] = [
            {
                source: 'S1',
                value: 0.01,
                distribution: 'Rectangular',
                divisor: 1.73205,
                standard_uncertainty: 0.01 / 1.73205
            },
            {
                source: 'S2',
                value: 0.005,
                distribution: 'Normal',
                divisor: 1,
                standard_uncertainty: 0.005
            }
        ]

        const { expanded } = calculateExpandedUncertainty(sources, 2)
        
        // combined = sqrt( (0.01/sqrt(3))^2 + 0.005^2 )
        // combined = sqrt( 0.000033333 + 0.000025 ) = sqrt(0.000058333) = 0.0076376
        // expanded = 0.0076376 * 2 = 0.015275
        
        expect(expanded).toBeCloseTo(0.015275, 5)
    })
})
