# Frontend Testing & Storybook Guide

This guide ensures the stability and visual consistency of the MetroLab frontend.

## 🧪 Testing Strategy

We follow a pyramid testing approach:

### 1. Unit Testing (Vitest)
**Focus:** Pure logic, calculation engines, and adapters.
- **Location:** `features/*/utils/*.test.ts`
- **What to test:** 
    - GUM uncertainty calculations.
    - Calibration result decision rules.
    - Data adapters (mapping API responses to local types).
- **Run:** `npm run test:unit`

### 2. Integration Testing (Vitest + Testing Library)
**Focus:** Complex forms and component interactions.
- **Location:** `features/*/components/*.test.tsx`
- **What to test:** 
    - Calibration Wizard step transitions.
    - Form validations (Zod errors).
    - Success/Error toast triggers.

### 3. E2E Testing (Playwright)
**Focus:** Critical user flows (The "Golden Paths").
- **What to test:**
    - Login -> Add Instrument -> Complete Calibration -> Approve -> Download PDF.
    - Opening and closing a Non-Conformity (RNC).
- **Run:** `npm run test:e2e`

## 🎨 Storybook (UI Library)

Storybook is our source of truth for visual components. Every generic UI component in `components/ui` or complex feature component should have a story.

### Best Practices:
- **Atomicity:** Start with base components (Buttons, Inputs).
- **Interactive States:** Provide stories for Loading, Disabled, and Error states.
- **Mocking Data:** Use Mock Service Worker (MSW) or dummy props to show components with realistic metrology data (e.g., an `AttachmentsList` with items).
- **Run:** `npm run storybook`

## 🏁 Quality Checklist before Features
- [x] No `any` types in feature logic (Targeted).
- [x] Zod schemas synced with Backend FormRequests.
- [x] All major metrology calculations covered by Vitest (`gum.test.ts`).
- [x] All data adapters covered by Vitest (`instrument-adapter.test.ts`, `calibration-adapter.test.ts`, `standard-adapter.test.ts`).
- [x] Storybook updated with new components (e.g., `SignatureModal`, `AttachmentsList`, `UncertaintyBudgetModal`, `TraceabilityGraph`).

- [x] Backend feature coverage for new modules (WorkOrders, Attachments, Competences).

