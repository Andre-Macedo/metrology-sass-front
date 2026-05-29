import type { Meta, StoryObj } from '@storybook/react'
import { AttachmentsList } from '@/features/system/components/attachments-list'

const meta: Meta<typeof AttachmentsList> = {
    title: 'System/AttachmentsList',
    component: AttachmentsList,
    parameters: {
        layout: 'padded',
    },
}

export default meta
type Story = StoryObj<typeof AttachmentsList>

const mockAttachments = [
    {
        id: 1,
        file_name: 'manual_paquimetro.pdf',
        original_name: 'Manual do Usuário - Paquímetro Mitutoyo.pdf',
        mime_type: 'application/pdf',
        size: 2500000,
        url: '#',
        created_at: new Date().toISOString(),
    },
    {
        id: 2,
        file_name: 'foto_dano.jpg',
        original_name: 'evidencia_dano_recebimento.jpg',
        mime_type: 'image/jpeg',
        size: 1200000,
        url: '#',
        created_at: new Date(Date.now() - 86400000).toISOString(),
    }
]

export const Default: Story = {
    args: {
        attachments: mockAttachments,
        attachableType: 'Instrument',
        attachableId: 1,
    },
}

export const Empty: Story = {
    args: {
        attachments: [],
        attachableType: 'Instrument',
        attachableId: 1,
    },
}
