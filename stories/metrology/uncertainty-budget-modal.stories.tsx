import type { Meta, StoryObj } from '@storybook/react'
import { UncertaintyBudgetModal } from '@/components/metrology/uncertainty-budget-modal'

const meta: Meta<typeof UncertaintyBudgetModal> = {
    title: 'Metrology/UncertaintyBudgetModal',
    component: UncertaintyBudgetModal,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof UncertaintyBudgetModal>

const mockBudget = [
    {
        source: 'Reference Standard Uncertainty',
        value: 0.005,
        divisor: 2,
        distribution: 'Normal',
        standard_uncertainty: 0.0025,
    },
    {
        source: 'Resolution (Instrument)',
        value: 0.01,
        divisor: 1.732,
        distribution: 'Rectangular',
        standard_uncertainty: 0.00577,
    },
    {
        source: 'Repeatability',
        value: 0.002,
        divisor: 1,
        distribution: 'Normal',
        standard_uncertainty: 0.002,
    }
]

export const Default: Story = {
    args: {
        isOpen: true,
        budget: mockBudget,
        kFactor: 2.00,
        onClose: () => console.log('Closed'),
        onSave: (newBudget, newU) => console.log('Saved', newBudget, newU),
    },
}

export const Empty: Story = {
    args: {
        isOpen: true,
        budget: [],
        kFactor: 2.00,
        onClose: () => console.log('Closed'),
    },
}
