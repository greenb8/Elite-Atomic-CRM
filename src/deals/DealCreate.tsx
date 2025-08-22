import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import {
    Create,
    Form,
    GetListResult,
    SaveButton,
    Toolbar,
    useDataProvider,
    useGetIdentity,
    useListContext,
    useRedirect,
} from 'react-admin';
import { DialogCloseButton } from '../misc/DialogCloseButton';
import { Deal } from '../types';
import { DealInputs } from './DealInputs';

export const DealCreate = ({ open }: { open: boolean }) => {
    const redirect = useRedirect();
    const dataProvider = useDataProvider();
    const { data: allDeals } = useListContext<Deal>();

    const handleClose = () => {
        redirect('/deals');
    };

    const queryClient = useQueryClient();

    const onSuccess = async (deal: Deal) => {
        // create line items if any
        const items = (globalThis as any).__LINE_ITEMS_ITEMS__ as
            | any[]
            | undefined;
        if (Array.isArray(items) && items.length > 0) {
            for (const it of items) {
                await dataProvider.create('deal_line_items', {
                    data: {
                        deal_id: deal.id,
                        product_id: it.product_id ?? null,
                        name: it.name,
                        description: it.description ?? null,
                        sku: it.sku ?? null,
                        price: it.price,
                        cost: it.cost ?? null,
                        quantity: it.quantity,
                    },
                });
            }
        }

        if (!allDeals) {
            redirect('/deals');
            return;
        }
        // increase the index of all deals in the same stage as the new deal
        const deals = allDeals.filter(
            (d: Deal) => d.stage === deal.stage && d.id !== deal.id
        );
        await Promise.all(
            deals.map(async oldDeal =>
                dataProvider.update('deals', {
                    id: oldDeal.id,
                    data: { index: oldDeal.index + 1 },
                    previousData: oldDeal,
                })
            )
        );
        const dealsById = deals.reduce(
            (acc, d) => ({
                ...acc,
                [d.id]: { ...d, index: d.index + 1 },
            }),
            {} as { [key: string]: Deal }
        );
        const now = Date.now();
        queryClient.setQueriesData<GetListResult | undefined>(
            { queryKey: ['deals', 'getList'] },
            res => {
                if (!res) return res;
                return {
                    ...res,
                    data: res.data.map((d: Deal) => dealsById[d.id] || d),
                };
            },
            { updatedAt: now }
        );
        redirect('/deals');
    };

    const { identity } = useGetIdentity();

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <Create<Deal>
                resource="deals"
                mutationOptions={{ onSuccess }}
                sx={{ '& .RaCreate-main': { mt: 0 } }}
            >
                <DialogCloseButton onClose={handleClose} />
                <DialogTitle
                    sx={{
                        paddingBottom: 0,
                    }}
                >
                    Create a new deal
                </DialogTitle>
                <Form
                    defaultValues={{
                        sales_id: identity?.id,
                        contact_ids: [],
                        index: 0,
                    }}
                >
                    <DialogContent>
                        <DealInputs />
                    </DialogContent>
                    <Toolbar>
                        <SaveButton />
                    </Toolbar>
                </Form>
            </Create>
        </Dialog>
    );
};
