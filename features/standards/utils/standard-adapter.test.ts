import { describe, it, expect } from 'vitest'
import { standardAdapter } from './adapters'

describe('Standard Adapter', () => {
    it('successfully parses a basic reference standard', () => {
        const data = {
            id: '10',
            name: 'Block Gauge 50mm',
            serial_number: 'BG-50',
            type: 'gauge_block',
            nominal_value: '50.00'
        }

        const result = standardAdapter(data)
        expect(result.id).toBe('10')
        expect(result.name).toBe('Block Gauge 50mm')
    })

    it('handles kits with children', () => {
        const data = {
            id: '100',
            name: 'Box Set',
            children: [
                { id: '101', name: 'Child 1', parent_id: '100' }
            ]
        }

        const result = standardAdapter(data)
        expect(result.children).toHaveLength(1)
        expect(result.children![0].parent_id).toBe('100')
    })

    it('transforms null serial number to N/A', () => {
        const data = {
            id: '11',
            name: 'No Serial Tool',
            serial_number: null
        }

        const result = standardAdapter(data)
        expect(result.serial_number).toBe('N/A')
    })
})
