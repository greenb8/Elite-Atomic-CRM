import * as React from 'react';
import {
    Create,
    SimpleForm,
    useGetIdentity,
} from 'react-admin';

import { ProposalInputs } from './ProposalInputs';

export const ProposalCreate = () => {
    const { identity } = useGetIdentity();

    const transform = (data: any) => ({
        ...data,
        created_by: identity?.id,
        status: data.status || 'draft',
        tax_rate: data.tax_rate || 0.0825,
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        deposit_amount: data.deposit_amount || 0,
        view_count: 0,
        is_template: false,
        data: {},
        client_data: {},
        sections: [],
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
                <ProposalInputs />
            </SimpleForm>
        </Create>
    );
};
