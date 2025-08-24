import { SvgIconComponent } from '@mui/icons-material';
import { Identifier, RaRecord } from 'react-admin';
import {
    COMPANY_CREATED,
    CONTACT_CREATED,
    CONTACT_NOTE_CREATED,
    DEAL_CREATED,
    DEAL_NOTE_CREATED,
} from './consts';

export type SignUpData = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
};

export type SalesFormData = {
    avatar: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    administrator: boolean;
    disabled: boolean;
};

export type Sale = {
    first_name: string;
    last_name: string;
    administrator: boolean;
    avatar?: RAFile;
    disabled?: boolean;
    user_id: string;

    /**
     * This is a copy of the user's email, to make it easier to handle by react admin
     * DO NOT UPDATE this field directly, it should be updated by the backend
     */
    email: string;

    /**
     * This is used by the fake rest provider to store the password
     * DO NOT USE this field in your code besides the fake rest provider
     * @deprecated
     */
    password?: string;
} & Pick<RaRecord, 'id'>;

export type Company = {
    name: string;
    logo: RAFile;
    sector: string;
    size: 1 | 10 | 50 | 250 | 500;
    linkedin_url: string;
    website: string;
    phone_number: string;
    address: string;
    zipcode: string;
    city: string;
    stateAbbr: string;
    sales_id: Identifier;
    created_at: string;
    description: string;
    revenue: string;
    tax_identifier: string;
    country: string;
    context_links?: string[];
    nb_contacts?: number;
    nb_deals?: number;
} & Pick<RaRecord, 'id'>;

export type EmailAndType = {
    email: string;
    type: 'Work' | 'Home' | 'Other';
};

export type PhoneNumberAndType = {
    number: string;
    type: 'Work' | 'Home' | 'Other';
};

export type ServiceAddressAndType = {
    address: string;
    city: string;
    state: string;
    zipcode: string;
    type: string;
    gate_code?: string | null;
    access_notes?: string | null;
    property_size?: string | null;
    service_notes?: string | null;
    lat?: number | null;
    lng?: number | null;
    migrated_from_single_address?: boolean;
};

export interface ServiceAddressType {
    value: string;
    label: string;
}

export type Contact = {
    first_name: string;
    last_name: string;
    title: string;
    company_id: Identifier;
    email_jsonb: EmailAndType[];
    avatar?: Partial<RAFile>;
    linkedin_url?: string | null;
    first_seen: string;
    last_seen: string;
    has_newsletter: Boolean;
    tags: Identifier[];
    gender: string;
    sales_id: Identifier;
    status: string;
    background: string;
    phone_jsonb: PhoneNumberAndType[];
    service_addresses_jsonb: ServiceAddressAndType[];
    billing_address?: string | null;
    billing_city?: string | null;
    billing_state?: string | null;
    billing_zipcode?: string | null;

    nb_tasks?: number;
    company_name?: string;
} & Pick<RaRecord, 'id'>;

export type Product = {
    name: string;
    description: string;
    price: number;
    cost?: number;
    sku?: string;
    vendor?: string;
    size?: string;
    image_path?: string;
    photos_paths?: string[];
    quantity_on_hand: number;
    quantity_sold: number;
    total_sold?: number; // For backward compatibility with views
    created_at: string;
    
    // Proposal-specific fields
    proposal_category?: string;
    is_proposal_visible?: boolean;
    proposal_description?: string;
    is_optional?: boolean;
    sort_order?: number;
    category?: string;
} & Pick<RaRecord, 'id'>;

export type ContactNote = {
    contact_id: Identifier;
    text: string;
    date: string;
    sales_id: Identifier;
    status: string;
    attachments?: AttachmentNote[];
} & Pick<RaRecord, 'id'>;

export type Deal = {
    name: string;
    company_id: Identifier;
    contact_ids: Identifier[];
    category: string;
    stage: string;
    description: string;
    amount: number;
    created_at: string;
    updated_at: string;
    archived_at?: string;
    expected_closing_date: string;
    sales_id: Identifier;
    index: number;
} & Pick<RaRecord, 'id'>;

export type DealNote = {
    deal_id: Identifier;
    text: string;
    date: string;
    sales_id: Identifier;
    attachments?: AttachmentNote[];

    // This is defined for compatibility with `ContactNote`
    status?: undefined;
} & Pick<RaRecord, 'id'>;

export type Tag = {
    name: string;
    color: string;
} & Pick<RaRecord, 'id'>;

export type Task = {
    contact_id: Identifier;
    type: string;
    text: string;
    due_date: string;
    done_date?: string | null;
    sales_id?: Identifier;
} & Pick<RaRecord, 'id'>;

export type ActivityCompanyCreated = {
    type: typeof COMPANY_CREATED;
    company_id: Identifier;
    company: Company;
    sales_id: Identifier;
    date: string;
};

export type ActivityContactCreated = {
    type: typeof CONTACT_CREATED;
    company_id: Identifier;
    sales_id?: Identifier;
    contact: Contact;
    date: string;
};

export type ActivityContactNoteCreated = {
    type: typeof CONTACT_NOTE_CREATED;
    sales_id?: Identifier;
    contactNote: ContactNote;
    date: string;
};

export type ActivityDealCreated = {
    type: typeof DEAL_CREATED;
    company_id: Identifier;
    sales_id?: Identifier;
    deal: Deal;
    date: string;
};

export type ActivityDealNoteCreated = {
    type: typeof DEAL_NOTE_CREATED;
    sales_id?: Identifier;
    dealNote: DealNote;
    date: string;
};

export type Activity = RaRecord &
    (
        | ActivityCompanyCreated
        | ActivityContactCreated
        | ActivityContactNoteCreated
        | ActivityDealCreated
        | ActivityDealNoteCreated
    );

export interface RAFile {
    src: string;
    title: string;
    path?: string;
    rawFile: File;
    type?: string;
}

export type AttachmentNote = RAFile;
export interface DealStage {
    value: string;
    label: string;
}

export interface NoteStatus {
    value: string;
    label: string;
    color: string;
}

export interface ContactGender {
    value: string;
    label: string;
    icon: SvgIconComponent;
}

export type ProposalTemplate = {
    name: string;
    description?: string;
    structure: Record<string, any>;
    default_sections: Record<string, any>[];
    is_active: boolean;
    is_default: boolean;
    created_by?: Identifier;
    created_at: string;
    updated_at: string;
} & Pick<RaRecord, 'id'>;

export type Proposal = {
    deal_id?: Identifier;
    template_id?: Identifier;
    title: string;
    status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
    data: Record<string, any>;
    client_data?: Record<string, any>;
    sections: Record<string, any>[];
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    deposit_amount: number;
    pdf_path?: string;
    pdf_generated_at?: string;
    is_template: boolean;
    original_proposal_id?: Identifier;
    sent_at?: string;
    viewed_at?: string;
    first_viewed_at?: string;
    view_count: number;
    responded_at?: string;
    expires_at?: string;
    created_by?: Identifier;
    created_at: string;
    updated_at: string;

    // Computed fields from views/joins
    deal_name?: string;
    contact_name?: string;
    company_name?: string;
    template_name?: string;
    line_item_count?: number;
    section_count?: number;
} & Pick<RaRecord, 'id'>;

export type ProposalLineItem = {
    proposal_id: Identifier;
    product_id?: Identifier;
    section_name: string;
    name: string;
    description?: string;
    image_paths?: string[];
    quantity: number;
    unit: string;
    unit_price: number;
    unit_cost?: number;
    total_price: number;
    total_cost?: number;
    is_visible_to_client: boolean;
    is_optional: boolean;
    is_selected_by_client: boolean;
    sort_order: number;
    section_sort_order: number;
    custom_data?: Record<string, any>;
    created_at: string;
    updated_at: string;
} & Pick<RaRecord, 'id'>;

export interface ProposalStatus {
    value: string;
    label: string;
    color: string;
}

// Landscaping-specific types for contact detail components

export interface BusinessInsight {
    id: string;
    label: string;
    value: string | number;
    icon: React.ComponentType;
    color?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export interface Property {
    id: string;
    contact_id?: string;
    name: string;
    address: string;
    size?: string;
    type: 'residential' | 'commercial';
    status: 'healthy' | 'needs-attention' | 'critical';
    notes?: string;
    created_at?: string;
    updated_at?: string;
    issues?: PropertyIssue[];
    services?: string[];
    lastService?: string;
    nextService?: string;
    images?: string[];
    crew?: string;
}

export interface PropertyIssue {
    id: string;
    type: 'maintenance' | 'damage' | 'improvement';
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in_progress' | 'resolved';
    createdAt: string;
    resolvedAt?: string;
}

export interface CommunicationEvent {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note' | 'text';
    title: string;
    description: string;
    date: string;
    priority: 'low' | 'medium' | 'high';
    status: 'completed' | 'pending' | 'follow_up_required';
    attachments?: string[];
    duration?: number; // in minutes for calls/meetings
}

export interface QuickAction {
    id: string;
    label: string;
    icon: React.ComponentType;
    color: string;
    action: () => void;
    disabled?: boolean;
    badge?: string | number;
}

export interface SeasonalRevenue {
    season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
    revenue: number;
    percentage: number;
}

export interface CrewMember {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    phone?: string;
}

export interface ServiceSchedule {
    id: string;
    service: string;
    frequency: string;
    nextDate: string;
    crew: CrewMember[];
    notes?: string;
}
