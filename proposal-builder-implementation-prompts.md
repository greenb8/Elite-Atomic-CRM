# Proposal Builder Implementation Prompts for Elite Landscaping CRM

## Overview

This document provides a comprehensive set of implementation prompts for building a PandaDoc-style proposal builder system in the Elite Landscaping CRM. Each prompt is designed to guide specific implementation phases while maintaining consistency with existing React-Admin patterns and Elite Landscaping design standards.

## Implementation Phases

### Phase 1: Database Setup & Migration (Week 1)

#### Prompt 1.1: Apply Database Migration
```
Apply the proposal builder database migration to set up the complete schema for the proposal system.

REQUIREMENTS:
- Use Supabase MCP server to apply migration: `supabase/migrations/20250823143000_proposal_builder_system.sql`
- Verify all tables are created: proposal_templates, proposals, proposal_line_items
- Confirm storage buckets are set up: proposal-images, proposal-pdfs
- Test that existing tables (products, deal_line_items, jobs) have new columns added
- Verify RLS policies are active and working

ACCEPTANCE CRITERIA:
- All new tables exist with proper relationships
- Storage buckets have correct RLS policies
- Existing tables enhanced without data loss
- Default Elite Landscaping template is created
- Products have proposal_category populated

TECHNICAL NOTES:
- Migration uses IF NOT EXISTS patterns for safety
- Leverages existing 'products' and 'attachments' storage buckets
- Adds total_cost column for profit margin tracking
- Includes proposal duplication and PDF generation support
```

#### Prompt 1.2: Populate Sample Data
```
Create sample proposal data to support development and testing of the proposal builder interface.

REQUIREMENTS:
- use supabase mcp server to populate sample data
- Add 5-10 products with proposal-specific data (proposal_category, is_proposal_visible, photos_paths)
- Create 2-3 sample proposals linked to existing deals
- Add proposal line items with different sections (Landscape Management, Installation Services, Additional Services)
- Set up sample proposal template variations
- Include products with different pricing tiers and optional status

ACCEPTANCE CRITERIA:
- Products catalog has landscaping-specific categories
- Sample proposals demonstrate section organization
- Line items show client interaction controls (visible/optional)
- Pricing calculations work correctly with tax
- Template system demonstrates reusability

TECHNICAL NOTES:
- Use existing products bucket for product images
- Follow Elite Landscaping service categories
- Include both recurring and one-time services
- Set realistic pricing for Texas market (8.25% tax)
```

### Phase 2: React-Admin Resources (Week 2)

#### Prompt 2.1: Create Proposal Resources
```
Implement the core React-Admin resources for proposal management following existing CRM patterns.

REQUIREMENTS:
- Create src/proposals/ directory with index.ts, ProposalList.tsx, ProposalCreate.tsx, ProposalEdit.tsx, ProposalShow.tsx
- Follow existing resource patterns from src/deals/ and src/contacts/
- Register proposal resource in src/root/CRM.tsx with appropriate icon
- Implement ProposalInputs.tsx with form fields for title, deal_id, template_id, status
- Add proposal filters and search functionality

ACCEPTANCE CRITERIA:
- Proposal resource appears in navigation menu
- CRUD operations work for proposals
- List view shows deal name, status, total amount, dates
- Edit form allows basic proposal management
- Show view displays proposal details and line items

TECHNICAL NOTES:
- Use ReferenceInput for deal_id selection
- Use SelectInput for status with predefined options
- Follow Elite Landscaping design system (colors: #0A2243, #FCBB1C)
- Use Material-UI components with sx prop styling
- Implement proper TypeScript types
```

#### Prompt 2.2: Create Proposal Template Resources
```
Implement React-Admin resources for managing reusable proposal templates.

REQUIREMENTS:
- Create src/proposals/templates/ directory with template management components
- Implement ProposalTemplateList.tsx, ProposalTemplateCreate.tsx, ProposalTemplateEdit.tsx
- Add template selection interface for creating new proposals
- Include template preview functionality
- Support template activation/deactivation

ACCEPTANCE CRITERIA:
- Template resource accessible from proposals menu
- Templates can be created, edited, and managed
- Default sections can be configured per template
- Template structure (branding, layout) can be customized
- Templates can be marked as default for new proposals

TECHNICAL NOTES:
- Use JsonInput for structure and default_sections fields
- Implement template preview with Elite Landscaping branding
- Follow existing patterns from src/companies/ for complex forms
- Use BooleanInput for is_active and is_default flags
```

### Phase 3: Proposal Builder Interface (Weeks 3-4)

#### Prompt 3.1: Main Proposal Builder Component
```
Create the core proposal builder interface that mimics PandaDoc's section-based editing experience.

REQUIREMENTS:
- Create src/proposals/ProposalBuilder.tsx as the main editing interface
- Implement section management with add/remove/reorder functionality
- Add drag-and-drop support for section and line item organization
- Include real-time pricing calculations with tax handling
- Provide Build vs Design tab interface
- Support auto-save with optimistic updates

ACCEPTANCE CRITERIA:
- Sections can be added, removed, and reordered
- Line items can be managed within sections
- Pricing updates automatically when items change
- Interface is responsive and follows Elite Landscaping design
- Auto-save prevents data loss
- Loading states and error handling implemented

TECHNICAL NOTES:
- Use Framer Motion for drag-and-drop animations
- Implement useDebounce for auto-save (1000ms delay)
- Use React Query for optimistic updates
- Follow Material-UI Card/Paper patterns for sections
- Use Elite Landscaping color scheme throughout
- Implement proper TypeScript interfaces for proposal data
```

#### Prompt 3.2: Product Catalog Modal
```
Build the product catalog selection modal that allows multi-select with quantity controls, matching PandaDoc's "From Catalog" functionality.

REQUIREMENTS:
- Create src/proposals/ProductCatalogModal.tsx with search, filter, and multi-select
- Implement real-time product search and category filtering
- Add quantity controls for each selected product
- Show running total calculation during selection
- Support bulk product addition to proposal sections
- Include product images and descriptions

ACCEPTANCE CRITERIA:
- Modal opens from proposal builder "Add Products" button
- Search works across product name, description, SKU
- Category filter shows proposal_category options
- Selected products show quantity controls and totals
- "Add Items" button integrates products into current section
- Product images display from existing 'products' bucket

TECHNICAL NOTES:
- Use Material-UI Dialog with maxWidth="lg"
- Implement useDebounce for search (300ms delay)
- Use existing ProductCard/ProductGrid patterns from src/products/
- Filter by is_proposal_visible = true
- Support keyboard navigation and accessibility
- Use existing photos_paths column for product images
```

#### Prompt 3.3: Line Item Editor Component
```
Create the line item editing interface with client visibility controls and pricing management.

REQUIREMENTS:
- Create src/proposals/LineItemEditor.tsx for individual line item management
- Implement inline editing for name, description, quantity, pricing
- Add client visibility controls (show/hide from client, optional selection)
- Include image management for line items
- Support section assignment and reordering
- Show both client price and internal cost (hidden from client view)

ACCEPTANCE CRITERIA:
- Line items can be edited inline with immediate feedback
- Visibility controls work (is_visible_to_client, is_optional)
- Pricing calculations update automatically (total_price, total_cost)
- Images can be added/removed from line items
- Section assignment can be changed via dropdown
- Internal costs are clearly marked as hidden from client

TECHNICAL NOTES:
- Use Material-UI TextField with onBlur for inline editing
- Implement BooleanInput for visibility controls
- Use NumberInput with currency formatting for pricing
- Support image upload to proposal-images bucket
- Use existing image display patterns from src/products/
- Implement proper validation for required fields
```

### Phase 4: PDF Generation & Email Integration (Week 4)

#### Prompt 4.1: PDF Generation Service
```
Implement PDF generation for proposals with Elite Landscaping branding and professional layout.

REQUIREMENTS:
- Create src/services/pdfGenerator.ts for proposal PDF creation
- Design PDF template with Elite Landscaping branding (#0A2243, #FCBB1C, Raleway font, @Original Logo.png)
- Include company logo, contact information, and professional layout
- Support section-based organization with line item details
- Hide internal costs and show only client-facing information
- Store generated PDFs in proposal-pdfs bucket

ACCEPTANCE CRITERIA:
- PDFs generate with professional Elite Landscaping branding
- Section organization matches proposal builder structure
- Only client-visible line items appear in PDF
- Pricing calculations are accurate with tax breakdown
- PDFs are stored securely in proposal-pdfs bucket
- PDF generation updates proposal.pdf_path and pdf_generated_at

TECHNICAL NOTES:
- Use library like jsPDF or Puppeteer for PDF generation
- Implement responsive PDF layout for different page sizes
- Include proposal metadata (creation date, expiration, proposal number)
- Support optional items with clear visual distinction
- Generate unique filenames with timestamp
- Implement error handling for PDF generation failures
```

#### Prompt 4.2: Email Integration Service
```
Create email service for sending proposals to clients with tracking and professional presentation.

REQUIREMENTS:
- Create src/services/emailService.ts for proposal distribution
- Design professional email template with Elite Landscaping branding
- Generate signed URLs for secure PDF access (7-day expiration)
- Include proposal summary and call-to-action in email
- Track email sends and update proposal status
- Support custom email messages and recipient management

ACCEPTANCE CRITERIA:
- Emails sent with professional Elite Landscaping template
- PDF attached or linked via secure signed URL
- Proposal status updates to 'sent' with timestamp
- Email tracking records recipient and send time
- Custom messages can be added to email template
- Error handling for email delivery failures

TECHNICAL NOTES:
- Use existing email service patterns if available
- Generate signed URLs with 7-day expiration for security
- Update proposal.sent_at timestamp on successful send
- Log email activity for sales team tracking
- Support multiple recipients (contact + additional emails)
- Include unsubscribe and company contact information
```

### Phase 5: CRM Integration (Week 5)

#### Prompt 5.1: Enhanced Deal Integration
```
Integrate proposal functionality into the existing Deal workflow and interface.

REQUIREMENTS:
- Enhance src/deals/DealShow.tsx to include proposal management section
- Add "Create Proposal" button for deals in appropriate stages
- Display existing proposals for the deal with status and actions
- Integrate proposal totals with deal amount tracking
- Support proposal-to-job conversion for won deals
- Add proposal activity to deal timeline

ACCEPTANCE CRITERIA:
- Deal Show page displays related proposals
- "Create Proposal" button appears for qualified deals
- Proposal status and totals visible in deal context
- Won proposals can generate jobs automatically
- Deal amount syncs with accepted proposal total
- Proposal activities appear in deal activity log

TECHNICAL NOTES:
- Use ReferenceManyField for proposal display
- Follow existing DealShow.tsx patterns and layout
- Use existing activity log patterns from src/activity/
- Implement conditional rendering based on deal stage
- Use existing button and action patterns
- Maintain Elite Landscaping design consistency
```

#### Prompt 5.2: Product Catalog Enhancement
```
Enhance the existing product management interface to support proposal-specific features.

REQUIREMENTS:
- Update src/products/ProductInputs.tsx to include proposal-specific fields
- Add proposal_category, is_proposal_visible, proposal_description fields
- Enhance src/products/ProductList.tsx to show proposal usage statistics
- Update src/products/ProductShow.tsx to display proposal context
- Support bulk editing of proposal visibility and categories
- Integrate with existing photos_paths for product images

ACCEPTANCE CRITERIA:
- Product forms include proposal-specific fields
- Product list shows proposal usage metrics
- Bulk actions support proposal field updates
- Product images work with existing 'products' bucket
- Proposal categories align with template sections
- Product visibility controls work in proposal catalog

TECHNICAL NOTES:
- Use existing ProductInputs.tsx patterns
- Add SelectInput for proposal_category with predefined options
- Use BooleanInput for is_proposal_visible
- Implement TextInput for proposal_description
- Use existing image upload patterns for photos_paths
- Follow existing product management UI patterns
```

### Phase 6: Testing & Quality Assurance (Week 6)

#### Prompt 6.1: Unit Testing Implementation
```
Create comprehensive unit tests for proposal builder components and functionality.

REQUIREMENTS:
- Create test files for all proposal components in src/proposals/__tests__/
- Test ProposalBuilder.tsx functionality (section management, calculations)
- Test ProductCatalogModal.tsx (search, selection, quantity controls)
- Test LineItemEditor.tsx (inline editing, visibility controls)
- Test PDF generation and email services
- Mock Supabase interactions and data providers

ACCEPTANCE CRITERIA:
- All proposal components have >80% test coverage
- Critical user flows are tested end-to-end
- Calculation engine accuracy is verified
- Error scenarios are handled properly
- Mock data matches production schema
- Tests run successfully in CI/CD pipeline

TECHNICAL NOTES:
- Use existing test patterns from src/tests/
- Use React Testing Library for component testing
- Mock Supabase client and data providers
- Test accessibility with screen reader simulation
- Use existing setupTests.js configuration
- Follow existing test naming conventions
```

#### Prompt 6.2: Integration Testing
```
Implement integration tests for the complete proposal workflow from creation to client acceptance.

REQUIREMENTS:
- Test complete proposal creation workflow
- Test product catalog integration and line item management
- Test PDF generation and email sending
- Test proposal duplication and template functionality
- Test integration with deals and jobs workflow
- Verify data consistency across related tables

ACCEPTANCE CRITERIA:
- End-to-end proposal workflow tests pass
- Database relationships maintain integrity
- File uploads work with storage buckets
- Email integration functions properly
- Proposal calculations are accurate
- Performance meets acceptable thresholds

TECHNICAL NOTES:
- Use existing integration test patterns
- Test against actual Supabase instance (staging)
- Verify storage bucket permissions and access
- Test with realistic data volumes
- Include error recovery scenarios
- Monitor performance metrics during testing
```

### Phase 7: Deployment & Monitoring (Week 7)

#### Prompt 7.1: Production Deployment Setup
```
Configure production environment for proposal builder system with monitoring and analytics.

REQUIREMENTS:
- Deploy database migration to production Supabase instance
- Configure email service for proposal sending (Postmark/SendGrid)
- Set up storage bucket permissions and CDN configuration
- Implement proposal analytics and tracking
- Configure monitoring for PDF generation and email delivery
- Set up backup and recovery procedures

ACCEPTANCE CRITERIA:
- Production database schema matches development
- Email service configured with Elite Landscaping branding
- Storage buckets optimized for performance and security
- Analytics track proposal creation, sends, and conversions
- Monitoring alerts for system failures
- Backup procedures tested and documented

TECHNICAL NOTES:
- Use existing deployment patterns from doc/developer/deploy.md
- Configure environment variables for email service
- Set up CDN for storage bucket optimization
- Implement logging for proposal activities
- Use existing monitoring infrastructure
- Document rollback procedures
```

#### Prompt 7.2: Performance Optimization
```
Optimize proposal builder performance for production use with large datasets and concurrent users.

REQUIREMENTS:
- Implement lazy loading for proposal sections and line items
- Optimize database queries with proper indexing
- Add caching for frequently accessed proposal templates
- Implement debounced auto-save to reduce database writes
- Optimize PDF generation for speed and memory usage
- Add loading states and skeleton screens

ACCEPTANCE CRITERIA:
- Proposal builder loads in <2 seconds
- Large proposals (50+ line items) remain responsive
- Database queries are optimized with proper indexes
- PDF generation completes in <10 seconds
- Auto-save doesn't impact user experience
- Loading states provide clear feedback

TECHNICAL NOTES:
- Use React.lazy for code splitting
- Implement virtual scrolling for large line item lists
- Use React Query for caching and background updates
- Optimize PDF generation with streaming
- Monitor performance with existing tools
- Follow existing performance patterns
```

### Phase 8: Advanced Features & Polish (Week 8)

#### Prompt 8.1: Client-Facing Proposal View
```
Create the client-facing proposal interface that allows customers to interact with proposals like PandaDoc's client view.

REQUIREMENTS:
- Create public proposal view accessible via signed URLs
- Implement interactive checkboxes for optional items
- Show real-time pricing updates based on client selections
- Include professional Elite Landscaping branding
- Support proposal acceptance/rejection workflow
- Track client interactions and view analytics

ACCEPTANCE CRITERIA:
- Clients can access proposals via secure links
- Optional items can be selected/deselected with price updates
- Professional presentation matches Elite Landscaping brand
- Acceptance workflow updates proposal and deal status
- Client interactions are tracked for sales team
- Mobile-responsive design for field use

TECHNICAL NOTES:
- Create separate public route outside main CRM
- Use signed URLs for secure access without authentication
- Implement client-side state management for selections
- Use Elite Landscaping color scheme and fonts
- Support touch interactions for mobile devices
- Track analytics without exposing internal data
```

#### Prompt 8.2: Advanced Template Management
```
Implement advanced template features including template marketplace, versioning, and collaborative editing.

REQUIREMENTS:
- Create template marketplace with categorized templates
- Implement template versioning and change tracking
- Add collaborative editing features for team templates
- Support template sharing and permissions
- Include template performance analytics
- Add template import/export functionality

ACCEPTANCE CRITERIA:
- Template marketplace shows categorized, searchable templates
- Template versions can be managed and restored
- Team members can collaborate on template creation
- Template usage analytics show performance metrics
- Templates can be shared between team members
- Import/export supports template distribution

TECHNICAL NOTES:
- Use existing permission patterns from sales table
- Implement version control with JSONB diff tracking
- Use WebSocket for real-time collaborative editing
- Create template categories specific to landscaping
- Track template usage and conversion metrics
- Support template backup and restore
```

## Implementation Guidelines

### Code Quality Standards
```
Follow these standards for all proposal builder implementation:

1. **TypeScript**: Use strict typing for all components and services
2. **React-Admin Patterns**: Follow existing resource and component patterns
3. **Elite Landscaping Design**: Use established color scheme and typography
4. **Testing**: Maintain >80% test coverage for all new code
5. **Performance**: Optimize for mobile and large datasets
6. **Accessibility**: Ensure WCAG AA compliance
7. **Security**: Follow RLS patterns and secure data handling
```

### File Organization
```
Organize proposal builder files following existing CRM structure:

src/proposals/
├── index.ts                     // Resource exports
├── ProposalList.tsx            // Main list view
├── ProposalCreate.tsx          // Creation form
├── ProposalEdit.tsx            // Edit form
├── ProposalShow.tsx            // Detail view
├── ProposalInputs.tsx          // Shared form inputs
├── ProposalBuilder.tsx         // Main builder interface
├── ProductCatalogModal.tsx     // Product selection
├── LineItemEditor.tsx          // Line item management
├── PricingCalculator.tsx       // Calculation engine
├── templates/                  // Template management
│   ├── ProposalTemplateList.tsx
│   ├── ProposalTemplateCreate.tsx
│   └── ProposalTemplateEdit.tsx
└── __tests__/                  // Test files
    ├── ProposalBuilder.spec.tsx
    └── ProductCatalogModal.spec.tsx
```

### Integration Points
```
Key integration points with existing CRM features:

1. **Deals**: Proposal creation from deals, status synchronization
2. **Products**: Catalog integration, image management, pricing
3. **Jobs**: Automatic job creation from accepted proposals
4. **Contacts**: Client information and email integration
5. **Properties**: Service location context for proposals
6. **Activity Log**: Proposal activities in deal timeline
```

### Success Metrics
```
Track these metrics to measure proposal builder success:

1. **Usage Metrics**: Proposals created per week, template usage
2. **Performance Metrics**: Creation time, PDF generation speed
3. **Business Metrics**: Conversion rate, average deal size
4. **User Experience**: Time to create, error rates, satisfaction
5. **Technical Metrics**: System performance, uptime, errors
```

## Conclusion

These implementation prompts provide a comprehensive roadmap for building a world-class proposal builder system that rivals PandaDoc while being perfectly tailored to Elite Landscaping's specific workflows and branding. Each prompt includes specific requirements, acceptance criteria, and technical notes to guide implementation while maintaining consistency with the existing CRM architecture.

The phased approach ensures steady progress with testable milestones, while the detailed technical specifications ensure the final system meets professional standards and business requirements.
