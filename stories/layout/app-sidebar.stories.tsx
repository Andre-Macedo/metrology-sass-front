import type { Meta, StoryObj } from '@storybook/react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const meta = {
    title: 'Layout/AppSidebar',
    component: AppSidebar,
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        (Story) => (
            <SidebarProvider>
                <div className="flex min-h-screen">
                    <Story />
                    <SidebarInset>
                        <div className="p-4">
                            <h1 className="text-2xl font-bold">Main Content Area</h1>
                            <p className="text-muted-foreground">The sidebar pushes this content.</p>
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        ),
    ],
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeaderStory: StoryObj<typeof Header> = {
    render: () => <Header />,
    name: 'Header (Mocked)',
    parameters: {
        // We might need to mock useAuth/useRouter here if it fails
    }
}
