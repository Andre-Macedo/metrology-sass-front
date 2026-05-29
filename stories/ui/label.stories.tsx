import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '@/components/ui/label';

const meta = {
    title: 'UI/Label',
    component: Label,
    tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        htmlFor: 'email',
        children: 'Your Email Address',
    },
};
