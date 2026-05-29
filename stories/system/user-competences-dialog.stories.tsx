import type { Meta, StoryObj } from '@storybook/react'
import { UserCompetencesDialog } from '@/features/system/users/user-competences-dialog'

const meta: Meta<typeof UserCompetencesDialog> = {
    title: 'System/UserCompetencesDialog',
    component: UserCompetencesDialog,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof UserCompetencesDialog>

export const Default: Story = {
    args: {
        open: true,
        onOpenChange: (open) => console.log('Open change:', open),
        user: {
            id: 1,
            name: 'John Doe (Technician)',
            email: 'john@example.com',
            created_at: new Date().toISOString()
        }
    },
}
