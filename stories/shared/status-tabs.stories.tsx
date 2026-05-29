import type { Meta, StoryObj } from '@storybook/react';
import { StatusTabs } from '@/components/shared/status-tabs';
import { useState } from 'react';

const meta = {
    title: 'Shared/StatusTabs',
    component: StatusTabs,
    tags: ['autodocs'],
} satisfies Meta<typeof StatusTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const StatusTabsDemo = (args: any) => {
    const [value, setValue] = useState(args.value || "all")
    return <StatusTabs {...args} value={value} onValueChange={setValue} />
}

export const Default: Story = {
    render: (args) => <StatusTabsDemo {...args} />,
    args: {
        value: "all",
        onValueChange: () => { }, // Mock function
        options: [
            { value: "all", label: "All Instruments" },
            { value: "active", label: "Active" },
            { value: "expired", label: "Expired" },
            { value: "maintenance", label: "Maintenance" },
        ]
    },
};

export const WithCounts: Story = {
    render: (args) => <StatusTabsDemo {...args} />,
    args: {
        value: "all",
        onValueChange: () => { }, // Mock function
        options: [
            { value: "all", label: "All", count: 124 },
            { value: "active", label: "Active", count: 98 },
            { value: "due", label: "Due Soon", count: 12 },
            { value: "expired", label: "Expired", count: 4 },
            { value: "maintenance", label: "Maintenance", count: 10 },
        ]
    },
};
