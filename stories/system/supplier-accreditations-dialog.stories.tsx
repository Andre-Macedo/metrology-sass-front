import type { Meta, StoryObj } from '@storybook/react'
import { SupplierAccreditationsDialog } from '@/features/system/suppliers/supplier-accreditations-dialog'

const meta: Meta<typeof SupplierAccreditationsDialog> = {
    title: 'System/SupplierAccreditationsDialog',
    component: SupplierAccreditationsDialog,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof SupplierAccreditationsDialog>

export const Default: Story = {
    args: {
        open: true,
        onOpenChange: (open) => console.log('Open change:', open),
        supplier: {
            id: 1,
            name: 'XYZ Calibration Lab',
            status: 'active',
            is_manufacturer: false,
            is_calibration_provider: true,
            is_maintenance_provider: true,
            created_at: new Date().toISOString()
        }
    },
}
