import { Button, DialogContent, Stack } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {
    DeleteButton,
    EditBase,
    Form,
    ReferenceField,
    SaveButton,
    Toolbar,
    useDataProvider,
    useNotify,
    useRecordContext,
    useRedirect,
} from 'react-admin';
import { Link } from 'react-router-dom';
import { DialogCloseButton } from '../misc/DialogCloseButton';
import { Deal } from '../types';
import { DealInputs } from './DealInputs';
import { CompanyAvatar } from '../companies/CompanyAvatar';

export const DealEdit = ({ open, id }: { open: boolean; id?: string }) => {
    const redirect = useRedirect();
    const notify = useNotify();
    const dataProvider = useDataProvider();

    const handleClose = () => {
        redirect('/deals', undefined, undefined, undefined, {
            _scrollToTop: false,
        });
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            sx={{
                '& .MuiDialog-container': {
                    alignItems: 'flex-start',
                },
            }}
        >
            {!!id ? (
                <EditBase
                    id={id}
                    mutationMode="pessimistic"
                    mutationOptions={{
                        onSuccess: async (data: any) => {
                            // Sync line items: simple strategy - delete existing, recreate from current editor state
                            try {
                                const existing = await dataProvider.getList(
                                    'deal_line_items',
                                    {
                                        pagination: { page: 1, perPage: 1000 },
                                        sort: { field: 'id', order: 'ASC' },
                                        filter: { deal_id_eq: data.id },
                                    }
                                );
                                for (const it of existing.data as any[]) {
                                    await dataProvider.delete(
                                        'deal_line_items',
                                        { id: it.id, previousData: it }
                                    );
                                }
                                const items = (globalThis as any)
                                    .__LINE_ITEMS_ITEMS__ as any[] | undefined;
                                if (Array.isArray(items)) {
                                    for (const it of items) {
                                        await dataProvider.create(
                                            'deal_line_items',
                                            {
                                                data: {
                                                    deal_id: data.id,
                                                    product_id:
                                                        it.product_id ?? null,
                                                    name: it.name,
                                                    description:
                                                        it.description ?? null,
                                                    sku: it.sku ?? null,
                                                    price: it.price,
                                                    cost: it.cost ?? null,
                                                    quantity: it.quantity,
                                                },
                                            }
                                        );
                                    }
                                }
                                notify('Deal updated');
                                redirect(
                                    `/deals/${data.id}/show`,
                                    undefined,
                                    undefined,
                                    undefined,
                                    { _scrollToTop: false }
                                );
                            } catch (e) {
                                notify('Error updating line items', {
                                    type: 'error',
                                });
                            }
                        },
                    }}
                >
                    <DialogCloseButton onClose={handleClose} top={13} />
                    <EditHeader />
                    <Form>
                        <DialogContent>
                            <DealInputs />
                        </DialogContent>
                        <EditToolbar />
                    </Form>
                </EditBase>
            ) : null}
        </Dialog>
    );
};

function EditHeader() {
    const deal = useRecordContext<Deal>();
    if (!deal) {
        return null;
    }

    return (
        <DialogTitle
            sx={{
                paddingBottom: 0,
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
            >
                <Stack direction="row" alignItems="center" gap={2}>
                    <ReferenceField
                        source="company_id"
                        reference="companies"
                        link="show"
                    >
                        <CompanyAvatar />
                    </ReferenceField>
                    <Typography variant="h6">Edit {deal.name} deal</Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ pr: 3 }}>
                    <Button
                        component={Link}
                        to={`/deals/${deal.id}/show`}
                        size="small"
                    >
                        Back to deal
                    </Button>
                </Stack>
            </Stack>
        </DialogTitle>
    );
}

function EditToolbar() {
    return (
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <SaveButton />
            <DeleteButton mutationMode="undoable" />
        </Toolbar>
    );
}
