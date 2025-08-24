import * as React from 'react';
import {
    Create,
    SimpleForm,
    useGetIdentity,
} from 'react-admin';

import { ProposalTemplateInputs, TemplatePreview } from './ProposalTemplateInputs';

export const ProposalTemplateCreate = () => {
    const { identity } = useGetIdentity();

    const transform = (data: any) => ({
        ...data,
        created_by: identity?.id,
        is_active: data.is_active !== false, // Default to true
        is_default: data.is_default || false,
        structure: typeof data.structure === 'string' ? JSON.parse(data.structure) : data.structure,
        default_sections: typeof data.default_sections === 'string' ? JSON.parse(data.default_sections) : data.default_sections,
    });

    return (
        <Create
            transform={transform}
            sx={{
                '& .RaCreate-main': {
                    backgroundColor: '#fafafb',
                },
            }}
        >
            <SimpleForm
                sx={{
                    backgroundColor: 'white',
                    borderRadius: 2,
                    p: 3,
                    boxShadow: 1,
                }}
            >
                <ProposalTemplateInputs />
                <TemplatePreview />
            </SimpleForm>
        </Create>
    );
};
