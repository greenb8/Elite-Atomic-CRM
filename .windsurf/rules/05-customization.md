---
trigger: glob
description:
globs: src/**/*.tsx
---
# Domain-Specific Customization Guide

This rule provides strategic guidance for adapting the CRM's core features to the specific workflows and terminology of the landscaping and lawn care industry. The primary goal of customization is to reduce cognitive load on the user by making the software speak their language.

Reference: See the project's technical documentation on this topic at `@doc/developer/customizing.md`.

## 1. Core Data Customization (`<CRM>` Props)

The most direct way to tailor the CRM is by providing domain-specific data via props to the `<CRM>` component. This ensures that all dropdowns, labels, and categories throughout the application are immediately familiar to our users.

-   **Central Configuration**: All core data options are centralized in `@src/App.tsx`.
-   **Recommended Values for Landscaping**: Use the following values as a starting point.

| Prop Name        | Recommended Values for Landscaping                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `dealStages`     | `['Inquiry', 'Estimate Sent', 'Job Won', 'In Progress', 'Completed', 'Billed', 'Lost']`                        |
| `dealCategories` | `['Lawn Maintenance', 'Landscape Design', 'Hardscaping', 'Irrigation Install', 'Tree Removal', 'Seasonal']`  |
| `taskTypes`      | `['Site Visit', 'Client Call', 'Team Dispatch', 'Supply Order', 'Follow-up']`                                  |
| `companySectors` | `['Residential', 'Commercial', 'HOA', 'Municipal']`                                                          |

-   **Implementation Example (`@src/App.tsx`)**:

    ```tsx
    import { CRM } from './root/CRM';

    const App = () => (
        <CRM
            title="Elite Landscaping CRM"
            logo="./img/logo.png"
            dealStages={[
                { value: 'inquiry', label: 'Inquiry' },
                { value: 'estimate-sent', label: 'Estimate Sent' },
                { value: 'job-won', label: 'Job Won' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'billed', label: 'Billed' },
                { value: 'lost', label: 'Lost' },
            ]}
        />
    );
    ```

## 2. Advanced Customization: Custom Views & Layouts

React Admin's philosophy is "Batteries Included But Removable." When a default layout is insufficient to provide the best user experience, we **must** replace it with a custom view.

-   **When to Create Custom Views**: If a default view (`<SimpleShowLayout>`, `<Datagrid>`) feels generic or fails to present the most relevant information for a landscaper, build a custom component.
-   **Prime Example (`ContactShow`)**: The default contact view is generic. A landscaper needs a specialized view that shows:
    -   Key contact information.
    -   **Associated Properties/Service Locations.**
    -   A timeline of past and upcoming jobs for that contact.
    -   Recent notes and communications.
-   **Actionable Guidance**: Do not hesitate to create a custom layout component to achieve a superior, context-rich user experience. See `@src/contacts/ContactShow.tsx` for a reference implementation.

## 3. Adherence to Design System

All customizations, from simple data changes to complex custom views, must align with our established brand identity and UX principles.

-   **Reference**: Before implementing any UI changes, consult the visual design system at `@.cursor/rules/01a-visual-design.mdc`.

import { CRM } from './root/CRM';

const App = () => <CRM disableTelemetry />;

