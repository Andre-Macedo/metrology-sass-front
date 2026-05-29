import type { Meta, StoryObj } from '@storybook/react'
import { InstrumentTypeForm } from '@/app/[locale]/(dashboard)/dashboard/metrology/settings/components/instrument-type-form'

const meta: Meta<typeof InstrumentTypeForm> = {
    title: 'Settings/InstrumentTypeForm',
    component: InstrumentTypeForm,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof InstrumentTypeForm>

export const Default: Story = {
    args: {
        onSuccess: () => console.log('Success'),
    },
}

export const Edit: Story = {
    args: {
        initialData: {
            id: 1,
            name: 'Caliper',
            calibration_frequency_months: 12,
            decision_rule: 'guard_band'
        },
        onSuccess: () => console.log('Success'),
    },
}
