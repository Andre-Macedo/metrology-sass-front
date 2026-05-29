import type { Meta, StoryObj } from '@storybook/react'
import { NotificationCenter } from '@/components/layout/notification-center'

const meta: Meta<typeof NotificationCenter> = {
    title: 'Layout/NotificationCenter',
    component: NotificationCenter,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof NotificationCenter>

export const Default: Story = {
    render: () => (
        <div className="flex justify-end p-4 bg-muted min-w-[200px]">
            <NotificationCenter />
        </div>
    )
}
