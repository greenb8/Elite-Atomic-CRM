import * as React from 'react';
import { Card, CardContent, CardHeader, List, ListItem, ListItemText } from '@mui/material';
import { useGetList, useRedirect } from 'react-admin';

export const LowStockProducts = ({ threshold = 10 }: { threshold?: number }) => {
	const redirect = useRedirect();
	const { data, isPending } = useGetList('products', {
		pagination: { page: 1, perPage: 10 },
		filter: { quantity_on_hand_lte: threshold },
		sort: { field: 'quantity_on_hand', order: 'ASC' },
	});

	return (
		<Card>
			<CardHeader title="Low Stock" subheader={`Below ${threshold} units`} />
			<CardContent>
				{isPending ? null : (
					<List dense>
						{(data || []).map((p: any) => (
							<ListItem key={p.id} button onClick={() => redirect('show', 'products', p.id)}>
								<ListItemText primary={p.name} secondary={`In stock: ${p.quantity_on_hand ?? 0}`} />
							</ListItem>
						))}
						{(data || []).length === 0 ? 'All good. No low stock.' : null}
					</List>
				)}
			</CardContent>
		</Card>
	);
};
