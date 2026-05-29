import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';

const meta = {
    title: 'UI/Textarea',
    component: Textarea,
    tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        placeholder: 'Type your message here.',
    },
};

export const Disabled: Story = {
    args: {
        placeholder: 'Type your message here.',
        disabled: true,
    },
};

export const WithLabel: Story = {
    render: (args) => (
        <div className="grid w-full gap-1.5">
            <label htmlFor="message-2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Your message</label>
            <Textarea id="message-2" {...args} />
            <p className="text-sm text-muted-foreground">Your message will be copied to the support team.</p>
        </div>
    )
}
