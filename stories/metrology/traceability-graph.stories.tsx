import type { Meta, StoryObj } from '@storybook/react'
import { TraceabilityGraph } from '@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/[id]/components/traceability-graph'

const meta: Meta<typeof TraceabilityGraph> = {
    title: 'Metrology/TraceabilityGraph',
    component: TraceabilityGraph,
    parameters: {
        layout: 'padded',
    },
}

export default meta
type Story = StoryObj<typeof TraceabilityGraph>

// Since TraceabilityGraph uses a hook internally, we need to mock it in the story or provide a wrapper.
// For Storybook, we can wrap it or ensure the mock provider handles it.

export const Default: Story = {
    args: {
        calibrationId: 'mock-123',
    },
}
