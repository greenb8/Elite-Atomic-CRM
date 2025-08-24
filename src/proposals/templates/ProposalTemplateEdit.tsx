import * as React from 'react';
import {
    Edit,
    SimpleForm,
} from 'react-admin';

import { ProposalTemplateInputs, TemplatePreview } from './ProposalTemplateInputs';

export const ProposalTemplateEdit = () => {
    const transform = (data: any) => ({
        ...data,
        structure: typeof data.structure === 'string' ? JSON.parse(data.structure) : data.structure,
        default_sections: typeof data.default_sections === 'string' ? JSON.parse(data.default_sections) : data.default_sections,
    });

    return (
        <Edit
            transform={transform}
            sx={{
                '& .RaEdit-main': {
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
        </Edit>
    );
};
