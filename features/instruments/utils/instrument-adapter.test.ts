import { describe, it, expect } from 'vitest'
import { instrumentAdapter } from './adapters'

describe('Instrument Adapter & Schema', () => {
    it('successfully parses a valid API response', () => {
        const apiData = {
            id: '1',
            name: 'Digital Caliper',
            serial_number: 'SN-123',
            manufacturer: 'Mitutoyo',
            model: 'CD-6',
            status: 'active',
            last_calibration_date: '2024-01-01',
            next_calibration_date: '2025-01-01',
            location: 'Quality Lab'
        }

        const result = instrumentAdapter(apiData)

        expect(result.id).toBe('1')
        expect(result.name).toBe('Digital Caliper')
        expect(result.serial_number).toBe('SN-123')
    })

    it('applies default values for missing optional fields', () => {
        const minimalData = {
            id: '2',
            name: 'Generic Tool'
        }

        const result = instrumentAdapter(minimalData)

        expect(result.serial_number).toBe('N/A')
        expect(result.manufacturer).toBe('Unknown')
        expect(result.location).toBe('Unassigned')
        expect(result.status).toBe('active')
    })

    it('handles null values by transforming them to defaults', () => {
        const nullData = {
            id: '3',
            name: 'Null Test',
            serial_number: null,
            location: null
        }

        const result = instrumentAdapter(nullData)

        expect(result.serial_number).toBe('N/A')
        expect(result.location).toBe('Unassigned')
    })

    it('fails when critical fields are missing', () => {
        const invalidData = {
            id: '4'
            // Missing 'name'
        }

        expect(() => instrumentAdapter(invalidData)).toThrow()
    })
})
