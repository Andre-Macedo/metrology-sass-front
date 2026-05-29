import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CalibrationWizardForm } from './calibration-wizard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../messages/en.json'

// Mock the hooks
vi.mock('@/app/[locale]/(dashboard)/dashboard/metrology/instruments/hooks/use-instruments', () => ({
    useInstruments: () => ({ data: { data: [{ id: '1', name: 'Test Instrument', serial_number: 'SN1' }] } })
}))

vi.mock('@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/hooks/use-calibrations', () => ({
    useCreateCalibration: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useUpdateCalibration: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useCalculateUncertainty: () => ({ mutate: vi.fn(), isPending: false }),
    useCompetenceCheck: () => ({ data: { can_proceed: true, has_competence: true } })
}))

vi.mock('@/features/system/hooks/use-system', () => ({
    useSuppliers: () => ({ data: { data: [] } }),
    useCheckSupplierAccreditation: () => ({ data: { is_accredited: true } })
}))

const queryClient = new QueryClient()

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <NextIntlClientProvider locale="en" messages={messages}>
            <QueryClientProvider client={queryClient}>
                {ui}
            </QueryClientProvider>
        </NextIntlClientProvider>
    )
}

describe('CalibrationWizard Integration', () => {
    it('renders the first step correctly', () => {
        renderWithProviders(<CalibrationWizardForm />)
        expect(screen.getByText(/Context & Identification/i)).toBeDefined()
    })

    it('navigates to measurements step when next is clicked', async () => {
        renderWithProviders(<CalibrationWizardForm />)
        
        const nextButton = screen.getByRole('button', { name: /Next/i })
        fireEvent.click(nextButton)

        // Wait for step 2 title
        expect(screen.getByText(/Procedure & Responsibility/i)).toBeDefined()
    })
})
