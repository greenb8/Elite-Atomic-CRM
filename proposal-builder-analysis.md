# Proposal Builder System Analysis: PandaDoc Study for Elite Landscaping CRM

## Executive Summary

After conducting a comprehensive analysis of PandaDoc's proposal builder system, this document outlines the key features, user experience patterns, and technical architecture that make PandaDoc's quote builder exceptional. This analysis serves as the foundation for implementing a customizable proposal builder in our Elite Landscaping CRM that connects seamlessly with our products, deals, and deal line items.

## Table of Contents

1. [PandaDoc System Architecture](#pandadoc-system-architecture)
2. [Core Features Analysis](#core-features-analysis)
3. [User Experience Patterns](#user-experience-patterns)
4. [Technical Implementation Insights](#technical-implementation-insights)
5. [Elite Landscaping CRM Integration Strategy](#elite-landscaping-crm-integration-strategy)
6. [Recommended Implementation Plan](#recommended-implementation-plan)
7. [Database Schema Recommendations](#database-schema-recommendations)
8. [UI/UX Design Principles](#uiux-design-principles)

---

## PandaDoc System Architecture

### Document Structure
PandaDoc organizes proposals using a **hierarchical, section-based architecture**:

```
Proposal Document
├── Cover Page (Branding/Header)
├── Content Sections
│   ├── Section 1: Service Category (e.g., "Landscape Management")
│   │   ├── Line Item 1: Individual Service/Product
│   │   ├── Line Item 2: Individual Service/Product
│   │   └── Section Totals & Calculations
│   ├── Section 2: Additional Services
│   └── Section N: Custom Sections
└── Grand Total (Tax calculations, Terms, etc.)
```

### Key Architectural Principles

1. **Modular Design**: Each section can be independently managed, shown/hidden, and customized
2. **Template-Based**: Reusable content blocks stored in a "Content Library"
3. **Data Separation**: Client-facing content vs. internal cost data
4. **Real-time Calculations**: Automatic price updates across all levels
5. **Version Control**: Template versioning and document state management

---

## Core Features Analysis

### 1. Quote Builder Interface

**Build vs. Design Tabs**
- **Build Tab**: Functional quote construction (line items, pricing, calculations)
- **Design Tab**: Visual customization (branding, layout, styling)

**Section Management**
- **Hierarchical Organization**: Services grouped into logical sections
- **Section-Level Controls**: Show/hide entire service categories
- **Flexible Structure**: Add/remove/reorder sections dynamically

### 2. Line Item Management

**Individual Line Item Properties**:
```javascript
{
  id: "unique_identifier",
  name: "Service/Product Name",
  description: "Detailed description",
  image: "product_image_url",
  price: 125.00,           // Client-facing price
  cost: 85.00,             // Internal cost (hidden from client)
  quantity: 2,
  unit: "each",
  category: "section_id",
  isVisible: true,         // Show/hide from client view
  isOptional: false,       // Required vs. optional items
  customFields: {}         // Extensible metadata
}
```

**Pricing Structure**:
- **Unit Price**: Base price per item
- **Quantity Multiplier**: Automatic calculation
- **Cost Tracking**: Internal cost for profit margin analysis
- **Visibility Control**: Hide internal costs from client view

### 3. Product Catalog Integration

**Catalog Features Observed**:
- **Search & Filter**: Real-time product search
- **Multi-Select**: Bulk product addition
- **Quantity Adjustment**: Pre-selection quantity modification
- **SKU Management**: Product identification system
- **Image Support**: Visual product representation
- **Pricing Tiers**: Different pricing based on context

**Catalog Workflow**:
1. Click "From Catalog" → Opens product selection modal
2. Search/browse products → Filter by category, price, etc.
3. Select multiple products → Checkbox-based selection
4. Adjust quantities → Individual quantity controls
5. Review selection → Total calculation preview
6. Add to quote → Integration into current section

### 4. Calculation Engine

**Multi-Level Calculations**:
```
Line Item Level:    Unit Price × Quantity = Line Total
Section Level:      Sum of all line items = Section Total
Document Level:     All sections + tax + fees = Grand Total
```

**Advanced Calculations Observed**:
- **Recurring vs. One-time**: Different calculation methods
- **Tax Integration**: Automatic tax calculation (8.25% observed)
- **Deposit Handling**: Upfront payment calculations
- **Contract Terms**: Multi-month service calculations

### 5. Client-Facing Customization

**Visibility Controls**:
- **Section-Level**: Show/hide entire service categories
- **Item-Level**: Individual line item visibility
- **Cost Privacy**: Internal costs never visible to client
- **Optional Items**: Clear distinction between required and optional

**Interactive Elements**:
- **Yellow Checkboxes**: Client can select/deselect optional items
- **Real-time Updates**: Price changes immediately reflect
- **Professional Presentation**: Clean, branded appearance

---

## User Experience Patterns

### 1. Progressive Disclosure
- **Overview First**: Start with high-level sections
- **Drill Down**: Click to access detailed line items
- **Context Switching**: Easy navigation between build/design modes

### 2. Immediate Feedback
- **Real-time Calculations**: Prices update instantly
- **Visual Confirmation**: Selected items clearly highlighted
- **Status Indicators**: Clear selection counts and totals

### 3. Bulk Operations
- **Multi-Select**: Select multiple products simultaneously
- **Batch Actions**: Apply changes to multiple items
- **Quantity Management**: Adjust quantities before adding

### 4. Error Prevention
- **Validation**: Prevent invalid configurations
- **Confirmation**: Clear action confirmations
- **Undo/Redo**: Easy mistake recovery

---

## Technical Implementation Insights

### 1. Data Architecture

**Separation of Concerns**:
- **Template Data**: Reusable content structures
- **Instance Data**: Specific proposal content
- **Product Data**: Catalog information
- **Pricing Data**: Cost and pricing logic

**Real-time Synchronization**:
- **WebSocket/SSE**: Live price updates
- **Optimistic Updates**: Immediate UI feedback
- **Conflict Resolution**: Handle concurrent edits

### 2. State Management

**Complex State Requirements**:
- **Document State**: Current proposal structure
- **Selection State**: Active items and quantities
- **Calculation State**: Derived pricing data
- **UI State**: Modal visibility, active sections

### 3. Performance Considerations

**Optimization Strategies Observed**:
- **Lazy Loading**: Load sections on demand
- **Debounced Calculations**: Prevent excessive recalculation
- **Caching**: Store frequently accessed data
- **Progressive Enhancement**: Core functionality first

---

## Elite Landscaping CRM Integration Strategy

### 1. Database Integration Points

**Existing Tables to Leverage**:
```sql
-- Core entities
deals (id, contact_id, property_id, stage, total_amount)
products (id, name, description, price, cost, category, image_path)
deal_line_items (id, deal_id, product_id, quantity, unit_price)

-- New entities needed
proposal_templates (id, name, structure, created_by)
proposal_sections (id, template_id, name, order, is_visible)
proposal_instances (id, deal_id, template_id, status, data)
```

### 2. React-Admin Integration

**New Resources Required**:
- **Proposals**: Main proposal management
- **ProposalTemplates**: Reusable proposal structures
- **ProposalSections**: Section management within templates

**Enhanced Existing Resources**:
- **Products**: Add proposal-specific fields (visibility, categories)
- **Deals**: Add proposal generation capabilities
- **DealLineItems**: Enhanced with proposal context

### 3. Component Architecture

**Proposed Component Structure**:
```
src/proposals/
├── ProposalBuilder.tsx          // Main builder interface
├── ProposalSectionManager.tsx   // Section CRUD operations
├── ProductCatalogModal.tsx      // Product selection interface
├── LineItemEditor.tsx           // Individual item management
├── PricingCalculator.tsx        // Calculation engine
├── ProposalPreview.tsx          // Client-facing preview
└── ProposalTemplateManager.tsx  // Template management
```

---

## Recommended Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
1. **Database Schema**: Create proposal-related tables
2. **Basic UI**: Simple proposal builder interface
3. **Product Integration**: Connect existing products table
4. **Basic Calculations**: Simple pricing calculations

### Phase 2: Core Features (Weeks 3-4)
1. **Section Management**: Add/remove/reorder sections
2. **Catalog Integration**: Product selection modal
3. **Line Item CRUD**: Full line item management
4. **Real-time Calculations**: Advanced pricing engine

### Phase 3: Advanced Features (Weeks 5-6)
1. **Template System**: Reusable proposal templates
2. **Client Customization**: Show/hide controls
3. **PDF Generation**: Professional proposal output with storage in `proposal-pdfs` bucket
4. **Email Integration**: Send proposals to clients
5. **Proposal Duplication**: Copy existing proposals with `duplicate_proposal()` function

### Phase 4: Polish & Integration (Weeks 7-8)
1. **UI/UX Refinement**: Professional styling
2. **Performance Optimization**: Fast, responsive interface
3. **Testing**: Comprehensive test coverage
4. **Documentation**: User and developer guides
5. **Advanced Features**: PDF archiving, proposal versioning, and template management

---

## Database Schema Recommendations

### Core Tables

```sql
-- Proposal Templates (Reusable structures)
CREATE TABLE proposal_templates (
    id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    structure JSONB NOT NULL, -- Section configuration
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES sales(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposal Instances (Specific proposals for deals)
CREATE TABLE proposals (
    id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    deal_id BIGINT REFERENCES deals(id) ON DELETE CASCADE,
    template_id BIGINT REFERENCES proposal_templates(id),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, viewed, accepted, rejected
    data JSONB NOT NULL, -- Complete proposal data
    client_data JSONB, -- Client-specific customizations
    total_amount DECIMAL(10,2),
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Products for Proposals
ALTER TABLE products ADD COLUMN IF NOT EXISTS 
    proposal_category VARCHAR(100),
    is_proposal_visible BOOLEAN DEFAULT true,
    proposal_description TEXT,
    proposal_image_path TEXT;

-- Proposal Line Items (Extends deal_line_items)
CREATE TABLE proposal_line_items (
    id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    proposal_id BIGINT REFERENCES proposals(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    section_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2), -- Internal cost
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    is_visible_to_client BOOLEAN DEFAULT true,
    is_optional BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    custom_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Proposal lookups
CREATE INDEX idx_proposals_deal_id ON proposals(deal_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_at ON proposals(created_at);

-- Line item queries
CREATE INDEX idx_proposal_line_items_proposal_id ON proposal_line_items(proposal_id);
CREATE INDEX idx_proposal_line_items_section ON proposal_line_items(section_name);
CREATE INDEX idx_proposal_line_items_sort ON proposal_line_items(proposal_id, sort_order);

-- Product catalog
CREATE INDEX idx_products_proposal_category ON products(proposal_category);
CREATE INDEX idx_products_proposal_visible ON products(is_proposal_visible);
```

---

## UI/UX Design Principles

### 1. Visual Hierarchy
- **Clear Section Separation**: Distinct visual boundaries
- **Progressive Disclosure**: Show details on demand
- **Consistent Spacing**: Follow Elite Landscaping design system

### 2. Interaction Patterns
- **Drag & Drop**: Reorder sections and line items
- **Inline Editing**: Quick text and number changes
- **Bulk Selection**: Multi-select for efficiency
- **Context Menus**: Right-click actions

### 3. Responsive Design
- **Mobile-First**: Touch-friendly controls
- **Tablet Optimization**: Ideal for field use
- **Desktop Power**: Full feature access

### 4. Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Clear focus indicators

---

## Integration with Existing CRM Features

### 1. Deal Workflow Integration
```typescript
// Enhanced Deal Show component
const DealShow = () => {
  const record = useRecordContext();
  
  return (
    <Show>
      <SimpleShowLayout>
        {/* Existing deal fields */}
        <TextField source="title" />
        <ReferenceField source="contact_id" reference="contacts" />
        
        {/* New proposal section */}
        <ProposalSection dealId={record.id} />
        
        {/* Enhanced line items with proposal context */}
        <ReferenceManyField 
          reference="proposal_line_items" 
          target="proposal_id"
        >
          <Datagrid>
            <TextField source="name" />
            <NumberField source="quantity" />
            <NumberField source="unit_price" />
            <BooleanField source="is_visible_to_client" />
          </Datagrid>
        </ReferenceManyField>
      </SimpleShowLayout>
    </Show>
  );
};
```

### 2. Product Catalog Enhancement
```typescript
// Enhanced Product List for proposal context
const ProductCatalogModal = ({ onSelect, selectedProducts }) => {
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('all');
  
  return (
    <Dialog open={true} maxWidth="lg">
      <DialogTitle>Select Products for Proposal</DialogTitle>
      <DialogContent>
        <ProductSearch 
          filter={filter} 
          onFilterChange={setFilter}
          category={category}
          onCategoryChange={setCategory}
        />
        <ProductGrid 
          products={filteredProducts}
          selectedProducts={selectedProducts}
          onSelectionChange={onSelect}
          showQuantityControls={true}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained">
          Add {selectedProducts.length} Items
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 3. Pricing Calculator Component
```typescript
// Real-time pricing calculations
const PricingCalculator = ({ lineItems, taxRate = 0.0825 }) => {
  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  }, [lineItems, taxRate]);
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Pricing Summary</Typography>
        <Divider />
        <PricingRow label="Subtotal" amount={calculations.subtotal} />
        <PricingRow label="Tax" amount={calculations.tax} />
        <Divider />
        <PricingRow 
          label="Total" 
          amount={calculations.total} 
          variant="h6" 
        />
      </CardContent>
    </Card>
  );
};
```

---

## Proposal Management Workflows

### 1. Proposal Retrieval & Editing

**Proposal List Interface**:
```typescript
// Proposal List with filtering and search
const ProposalList = () => (
  <List filters={<ProposalListFilter />}>
    <Datagrid>
      <TextField source="title" />
      <ReferenceField source="deal_id" reference="deals" />
      <TextField source="status" />
      <NumberField source="total_amount" options={{ style: 'currency', currency: 'USD' }} />
      <DateField source="created_at" />
      <DateField source="sent_at" />
      <EditButton />
      <ShowButton />
      <DuplicateButton />
    </Datagrid>
  </List>
);
```

**Proposal Editing Workflow**:
1. **Access**: Navigate to proposal from deals or proposal list
2. **Edit Mode**: Click "Edit" to enter proposal builder
3. **Section Management**: Add/remove/reorder sections
4. **Line Item Management**: Add products from catalog, adjust quantities, set visibility
5. **Real-time Preview**: See client-facing view while editing
6. **Auto-save**: Changes saved automatically with optimistic updates

### 2. Proposal Duplication System

**Duplication Function Usage**:
```sql
-- Duplicate proposal for same deal
SELECT duplicate_proposal(123, 'Revised Proposal V2');

-- Duplicate proposal for new deal
SELECT duplicate_proposal(123, 'New Client Proposal', 456);

-- Duplicate as template
SELECT duplicate_proposal(123, 'Standard Landscaping Template');
```

**Frontend Duplication Interface**:
```typescript
const DuplicateProposalButton = ({ proposalId }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dealId, setDealId] = useState(null);
  
  const handleDuplicate = async () => {
    const result = await dataProvider.create('proposals/duplicate', {
      data: { 
        originalProposalId: proposalId,
        title: title || undefined,
        dealId: dealId || undefined
      }
    });
    
    redirect(`/proposals/${result.data.id}/edit`);
  };
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <ContentCopyIcon /> Duplicate
      </Button>
      <DuplicateDialog 
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDuplicate}
        title={title}
        setTitle={setTitle}
        dealId={dealId}
        setDealId={setDealId}
      />
    </>
  );
};
```

### 3. Proposal Saving & Status Management

**Status Workflow**:
```
Draft → Sent → Viewed → Accepted/Rejected
  ↓       ↓       ↓         ↓
Save   Email   Track    Convert to Job
```

**Save Operations**:
```typescript
// Auto-save functionality
const useProposalAutoSave = (proposalId) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const debouncedSave = useMemo(
    () => debounce(async (data) => {
      setIsSaving(true);
      try {
        await dataProvider.update('proposals', {
          id: proposalId,
          data: data,
          previousData: {}
        });
        setIsDirty(false);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [proposalId]
  );
  
  return { isDirty, isSaving, save: debouncedSave };
};
```

### 4. PDF Generation & Storage

**PDF Generation Workflow**:
```typescript
const generateProposalPDF = async (proposalId) => {
  // 1. Fetch proposal data with line items
  const proposal = await dataProvider.getOne('proposals', { id: proposalId });
  const lineItems = await dataProvider.getList('proposal_line_items', {
    filter: { proposal_id: proposalId },
    sort: { field: 'section_sort_order', order: 'ASC' }
  });
  
  // 2. Generate PDF using template engine
  const pdfBuffer = await generatePDF({
    template: 'elite-landscaping-proposal',
    data: {
      proposal,
      lineItems: lineItems.data,
      branding: {
        logo: '/logos/elite-landscaping.png',
        colors: { primary: '#0A2243', accent: '#FCBB1C' }
      }
    }
  });
  
  // 3. Upload to proposal-pdfs bucket
  const fileName = `proposal-${proposalId}-${Date.now()}.pdf`;
  const filePath = `proposals/${proposalId}/${fileName}`;
  
  await supabase.storage
    .from('proposal-pdfs')
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false
    });
  
  // 4. Update proposal record with PDF path
  await dataProvider.update('proposals', {
    id: proposalId,
    data: {
      pdf_path: filePath,
      pdf_generated_at: new Date().toISOString()
    }
  });
  
  return filePath;
};
```

### 5. Proposal Sending & Client Interaction

**Email Integration**:
```typescript
const sendProposal = async (proposalId, recipientEmail) => {
  // 1. Generate PDF if not exists or outdated
  const proposal = await dataProvider.getOne('proposals', { id: proposalId });
  
  if (!proposal.pdf_path || needsRegeneration(proposal)) {
    await generateProposalPDF(proposalId);
  }
  
  // 2. Generate signed URL for client access
  const { data: signedUrl } = await supabase.storage
    .from('proposal-pdfs')
    .createSignedUrl(proposal.pdf_path, 60 * 60 * 24 * 7); // 7 days
  
  // 3. Send email with proposal link
  await emailService.send({
    to: recipientEmail,
    template: 'proposal-notification',
    data: {
      proposalTitle: proposal.title,
      proposalUrl: signedUrl.signedUrl,
      companyName: 'Elite Landscaping DFW',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  
  // 4. Update proposal status and tracking
  await dataProvider.update('proposals', {
    id: proposalId,
    data: {
      status: 'sent',
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
};
```

**Client Interaction Tracking**:
```typescript
// Track proposal views and interactions
const trackProposalView = async (proposalId, clientInfo) => {
  await dataProvider.update('proposals', {
    id: proposalId,
    data: {
      status: 'viewed',
      viewed_at: new Date().toISOString(),
      first_viewed_at: proposal.first_viewed_at || new Date().toISOString(),
      view_count: (proposal.view_count || 0) + 1
    }
  });
  
  // Log activity for sales team
  await dataProvider.create('proposal_activities', {
    data: {
      proposal_id: proposalId,
      activity_type: 'viewed',
      client_info: clientInfo,
      timestamp: new Date().toISOString()
    }
  });
};
```

### 6. Template Management & Reuse

**Template Creation from Proposals**:
```typescript
const saveAsTemplate = async (proposalId, templateName) => {
  const proposal = await dataProvider.getOne('proposals', { id: proposalId });
  
  // Create template from proposal structure
  const template = await dataProvider.create('proposal_templates', {
    data: {
      name: templateName,
      description: `Template created from proposal: ${proposal.title}`,
      structure: proposal.data,
      default_sections: proposal.sections,
      is_active: true,
      is_default: false
    }
  });
  
  // Mark original proposal as template source
  await dataProvider.update('proposals', {
    id: proposalId,
    data: { is_template: true }
  });
  
  return template.data.id;
};
```

**Template Application**:
```typescript
const createFromTemplate = async (templateId, dealId, customizations = {}) => {
  const template = await dataProvider.getOne('proposal_templates', { id: templateId });
  
  // Create new proposal from template
  const proposal = await dataProvider.create('proposals', {
    data: {
      deal_id: dealId,
      template_id: templateId,
      title: `${template.name} - ${new Date().toLocaleDateString()}`,
      status: 'draft',
      data: { ...template.structure, ...customizations },
      sections: template.default_sections,
      tax_rate: 0.0825
    }
  });
  
  return proposal.data.id;
};
```

---

## Success Metrics & KPIs

### 1. User Adoption
- **Proposal Creation Rate**: Proposals created per deal
- **Template Usage**: Most popular templates
- **Time to Create**: Average proposal creation time

### 2. Business Impact
- **Conversion Rate**: Proposals to closed deals
- **Average Deal Size**: Impact on deal values
- **Client Engagement**: Proposal view/interaction rates

### 3. System Performance
- **Load Times**: Proposal builder performance
- **Error Rates**: System reliability metrics
- **User Satisfaction**: Feedback and usability scores

---

## Conclusion

PandaDoc's proposal builder succeeds through its combination of:

1. **Intuitive Section-Based Architecture**: Logical organization that mirrors business thinking
2. **Powerful Product Catalog Integration**: Seamless connection between inventory and proposals
3. **Real-time Calculation Engine**: Immediate feedback and professional accuracy
4. **Client-Centric Customization**: Perfect balance of control and simplicity
5. **Professional Presentation**: Branded, polished output that builds trust

For Elite Landscaping CRM, implementing these patterns will create a proposal system that:
- **Reduces Proposal Creation Time**: From hours to minutes
- **Increases Deal Conversion**: Professional, accurate proposals
- **Improves Client Experience**: Interactive, customizable proposals
- **Enhances Profit Margins**: Better cost tracking and pricing control

The recommended phased approach ensures we can deliver value quickly while building toward a comprehensive solution that rivals industry-leading tools like PandaDoc.
