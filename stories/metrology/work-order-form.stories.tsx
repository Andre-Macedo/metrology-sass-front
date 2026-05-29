import type { Meta, StoryObj } from '@storybook/react'
import { WorkOrderForm } from '@/features/work-orders/components/work-order-form'

const meta: Meta<typeof WorkOrderForm> = {
    title: 'WorkOrders/WorkOrderForm',
    component: WorkOrderForm,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof WorkOrderForm>

export const Default: Story = {
    args: {
        onSuccess: () => console.log('Success'),
    },
}
