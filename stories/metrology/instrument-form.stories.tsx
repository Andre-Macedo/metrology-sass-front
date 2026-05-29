import type { Meta, StoryObj } from '@storybook/react'
import { InstrumentForm } from '@/features/instruments/components/instrument-form'

const meta: Meta<typeof InstrumentForm> = {
    title: 'Instruments/InstrumentForm',
    component: InstrumentForm,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof InstrumentForm>

export const Default: Story = {
    args: {
        onSubmit: (values) => console.log('Submit', values),
        isLoading: false,
    },
}
