import { Avatar, SxProps } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useRecordContext } from 'react-admin';

import { Product } from '../types';

interface Props {
    sx?: SxProps;
}

export const ProductAvatar = ({ sx }: Props) => {
    const record = useRecordContext<Product>();
    if (!record) return null;

    return (
        <Avatar src={record.image_path} sx={sx} alt={record.name}>
            <InventoryIcon />
        </Avatar>
    );
};
