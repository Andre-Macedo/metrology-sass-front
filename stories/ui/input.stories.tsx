import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';

const meta = {
    title: 'UI/Input',
    component: Input,
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'password', 'email', 'number', 'date', 'file'],
        },
        disabled: {
            control: 'boolean',
        },
    },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        placeholder: 'Enter text here...',
        type: 'text',
    },
};

export const WithValue: Story = {
    args: {
        placeholder: 'Enter text here...',
        value: 'Some value',
        type: 'text',
    },
};

export const Disabled: Story = {
    args: {
        placeholder: 'Disabled input',
        disabled: true,
    },
};
