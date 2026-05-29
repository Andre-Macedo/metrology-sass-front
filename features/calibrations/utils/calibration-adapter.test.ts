import { describe, it, expect } from 'vitest'
import { calibrationAdapter } from './adapters'

describe('Calibration Adapter', () => {
    it('successfully maps backend statuses to frontend result types', () => {
        const scenarios = [
            { key: 'approved', expected: 'pass' },
            { key: 'rejected', expected: 'fail' },
            { key: 'conditional', expected: 'conditional' },
            { key: 'approved_with_restrictions', expected: 'approved_with_restrictions' },
        ]

        scenarios.forEach(({ key, expected }) => {
            const data = {
                id: '1',
                status_key: key,
                calibration_date: '2024-01-01',
                calibrated_item_name: 'Test'
            }
            const result = calibrationAdapter(data)
            expect(result.result).toBe(expected)
        })
    })

    it('parses dd/mm/yyyy dates into ISO format', () => {
        const data = {
            id: '1',
            status_key: 'approved',
            calibration_date: '15/05/2024',
            next_calibration_due: '15/05/2025'
        }
        
        const result = calibrationAdapter(data)
        expect(result.date).toBe('2024-05-15')
        expect(result.next_due_date).toBe('2025-05-15')
    })

    it('handles missing or N/A data gracefully', () => {
        const data = {
            id: '1',
            status_key: 'unknown',
            calibration_date: 'N/A'
        }
        
        const result = calibrationAdapter(data)
        expect(result.result).toBe('unknown')
        expect(result.instrument_name).toBe('N/A')
    })
})
