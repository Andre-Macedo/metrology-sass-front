import type { Meta, StoryObj } from '@storybook/react'
import { SignatureModal } from '@/features/calibrations/components/signature-modal'

const meta: Meta<typeof SignatureModal> = {
    title: 'Calibrations/SignatureModal',
    component: SignatureModal,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof SignatureModal>

export const Default: Story = {
    args: {
        isOpen: true,
        onClose: () => console.log('Closed'),
        onConfirm: (password) => console.log('Confirmed with password:', password),
        isLoading: false,
    },
}

export const Loading: Story = {
    args: {
        isOpen: true,
        onClose: () => console.log('Closed'),
        onConfirm: (password) => console.log('Confirmed'),
        isLoading: true,
    },
}
