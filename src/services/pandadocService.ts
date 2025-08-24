import { ProposalLineItem } from '../types';

type PandaDocStatus =
    | 'document.draft'
    | 'document.sent'
    | 'document.viewed'
    | 'document.completed'
    | 'document.declined'
    | string;

interface PandaDocRecipient {
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
}

interface PandaDocTokenField {
    name: string;
    value: string;
}

interface PandaDocPricingRow {
    name: string;
    price?: number;
    quantity?: number;
    cost?: number;
    description?: string;
}

interface PandaDocPricingTableSection {
    title?: string;
    rows: PandaDocPricingRow[];
}

interface PandaDocPricingTable {
    name?: string;
    sections: PandaDocPricingTableSection[];
}

interface CreateDocumentRequest {
    name: string;
    template_uuid: string;
    recipients: PandaDocRecipient[];
    tokens?: PandaDocTokenField[];
    pricing_tables?: PandaDocPricingTable[];
    fields?: Record<string, { value: string | number | boolean }>;
    metadata?: Record<string, string>;
    tags?: string[];
}

interface PandaDocDocument {
    id: string;
    name: string;
    status: PandaDocStatus;
    date_created?: string;
    date_modified?: string;
}

export class PandaDocService {
    private readonly apiKey: string;
    private readonly baseUrl: string = 'https://api.pandadoc.com/public/v1';
    private readonly templateId: string;

    constructor() {
        this.apiKey = (import.meta as any).env?.VITE_PANDADOC_API_KEY || '';
        this.templateId =
            (import.meta as any).env?.VITE_PANDADOC_TEMPLATE_ID ||
            'fKLnopjBoNpBbFFkBeRCZh';

        if (!this.apiKey) {
            // Non-fatal: caller can decide to fall back
            console.warn(
                'PandaDoc API key missing (VITE_PANDADOC_API_KEY). PandaDoc integration disabled.'
            );
        }
    }

    isEnabled(): boolean {
        return Boolean(this.apiKey);
    }

    private async request<T>(path: string, init?: RequestInit): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            ...init,
            headers: {
                Authorization: `API-Key ${this.apiKey}`,
                ...(init?.body && { 'Content-Type': 'application/json' }),
                ...(init?.headers || {}),
            },
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`PandaDoc ${res.status}: ${text}`);
        }
        // Some endpoints return empty body (e.g., send), guard parse
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            // Return empty object when no JSON body is present
            return {} as T;
        }
        return res.json() as Promise<T>;
    }

    async createDocumentFromTemplate(params: {
        name: string;
        recipients: PandaDocRecipient[];
        tokens: PandaDocTokenField[];
        pricingTables?: PandaDocPricingTable[];
        fields?: CreateDocumentRequest['fields'];
        metadata?: Record<string, string>;
        tags?: string[];
    }): Promise<PandaDocDocument> {
        const body: CreateDocumentRequest = {
            name: params.name,
            template_uuid: this.templateId,
            recipients: params.recipients,
            tokens: params.tokens,
            pricing_tables: params.pricingTables,
            fields: params.fields,
            metadata: params.metadata,
            tags: params.tags,
        };

        return this.request<PandaDocDocument>('/documents', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async getDocument(documentId: string): Promise<PandaDocDocument> {
        return this.request<PandaDocDocument>(`/documents/${documentId}`);
    }

    async downloadPdf(documentId: string): Promise<Blob> {
        const res = await fetch(
            `${this.baseUrl}/documents/${documentId}/download`,
            {
                headers: { Authorization: `API-Key ${this.apiKey}` },
            }
        );
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`PandaDoc download error ${res.status}: ${text}`);
        }
        return res.blob();
    }

    async sendDocument(documentId: string, message?: string): Promise<void> {
        await this.request(`/documents/${documentId}/send`, {
            method: 'POST',
            body: JSON.stringify({
                message: message || 'Please review and sign.',
            }),
        });
    }

    // Variable mapping per .cursor/proposal-instructions-and-info/pandadoc-variables.md
    buildTokens(input: {
        clientFirstName?: string;
        clientLastName?: string;
        streetAddress?: string;
        city?: string;
        postalCode?: string;
    }): PandaDocTokenField[] {
        const tokens: PandaDocTokenField[] = [];
        if (input.clientFirstName)
            tokens.push({
                name: 'Client.FirstName',
                value: input.clientFirstName,
            });
        if (input.clientLastName)
            tokens.push({
                name: 'Client.LastName',
                value: input.clientLastName,
            });
        if (input.streetAddress)
            tokens.push({
                name: 'Client.StreetAddress',
                value: input.streetAddress,
            });
        if (input.city) tokens.push({ name: 'Client.City', value: input.city });
        if (input.postalCode)
            tokens.push({ name: 'Client.PostalCode', value: input.postalCode });
        return tokens;
    }

    // Line items mapping per spec: Name, Price, Quantity, Cost
    buildPricingTableFromLineItems(
        lineItems: ProposalLineItem[]
    ): PandaDocPricingTable[] {
        const rows: PandaDocPricingRow[] = lineItems
            .filter(li => li.is_visible_to_client)
            .map(li => ({
                name: li.name,
                price: Number(li.unit_price ?? 0),
                quantity: Number(li.quantity ?? 1),
                cost: Number(
                    li.total_price ??
                        Number(li.unit_price ?? 0) * Number(li.quantity ?? 1)
                ),
                description: li.description || undefined,
            }));

        return [
            {
                name: 'Items',
                sections: [
                    {
                        title: 'Quote',
                        rows,
                    },
                ],
            },
        ];
    }
}

export const pandaDocService = new PandaDocService();
