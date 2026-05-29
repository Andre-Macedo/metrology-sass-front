import type { Meta, StoryObj } from '@storybook/react'
import { MaterialForm } from '@/app/[locale]/(dashboard)/dashboard/metrology/settings/components/material-form'

const meta: Meta<typeof MaterialForm> = {
    title: 'Settings/MaterialForm',
    component: MaterialForm,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof MaterialForm>

export const Default: Story = {
    args: {
        onSuccess: () => console.log('Success'),
    },
}

export const Edit: Story = {
    args: {
        initialData: {
            id: 1,
            name: 'Steel',
            cte: 11.5,
            category: 'Metal'
        },
        onSuccess: () => console.log('Success'),
    },
}
