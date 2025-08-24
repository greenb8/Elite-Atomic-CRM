import * as React from 'react';
import {
    Edit,
    SimpleForm,
} from 'react-admin';

import { ProposalInputs } from './ProposalInputs';

export const ProposalEdit = () => {
    return (
        <Edit
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
                <ProposalInputs />
            </SimpleForm>
        </Edit>
    );
};
