/* eslint-disable import/no-anonymous-default-export */
import type { Theme } from '@mui/material';
import {
    Box,
    Card,
    CardContent,
    Checkbox,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { formatRelative } from 'date-fns';
import {
    RecordContextProvider,
    ReferenceField,
    SimpleListLoading,
    TextField,
    useListContext,
} from 'react-admin';
import { Link } from 'react-router-dom';

import { Status } from '../misc/Status';
import { Contact } from '../types';
import { Avatar } from './Avatar';
import { TagsList } from './TagsList';

export const ContactListContent = () => {
    const {
        data: contacts,
        error,
        isPending,
        onToggleItem,
        selectedIds,
    } = useListContext<Contact>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
    
    if (isPending) {
        return <SimpleListLoading hasLeftAvatarOrIcon hasSecondaryText />;
    }
    if (error) {
        return null;
    }
    const now = Date.now();

    // Mobile card layout
    if (isMobile) {
        return (
            <Box sx={{ p: 1 }}>
                <Grid container spacing={2}>
                    {contacts.map(contact => (
                        <Grid key={contact.id} xs={12}>
                            <RecordContextProvider value={contact}>
                                <Card 
                                    component={Link}
                                    to={`/contacts/${contact.id}/show`}
                                    sx={{ 
                                        textDecoration: 'none',
                                        '&:hover': {
                                            boxShadow: theme.shadows[4],
                                            transform: 'translateY(-1px)',
                                            transition: 'all 0.2s ease-in-out'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Checkbox
                                                checked={selectedIds.includes(contact.id)}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onToggleItem(contact.id);
                                                }}
                                                size="small"
                                            />
                                            <Avatar />
                                            <Box flex={1} minWidth={0}>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    fontWeight={600}
                                                    noWrap
                                                    color="text.primary"
                                                >
                                                    {contact.first_name} {contact.last_name ?? ''}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary"
                                                    noWrap
                                                >
                                                    {contact.title}
                                                    {contact.title && contact.company_id != null && ' at '}
                                                    {contact.company_id != null && (
                                                        <ReferenceField
                                                            source="company_id"
                                                            reference="companies"
                                                            link={false}
                                                        >
                                                            <TextField source="name" />
                                                        </ReferenceField>
                                                    )}
                                                </Typography>
                                                {contact.last_seen && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatRelative(contact.last_seen, now)}
                                                        <Status status={contact.status} />
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                        <Box mt={1}>
                                            <TagsList />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </RecordContextProvider>
                        </Grid>
                    ))}
                </Grid>
                {contacts.length === 0 && (
                    <Box p={3} textAlign="center">
                        <Typography color="text.secondary">No contacts found</Typography>
                    </Box>
                )}
            </Box>
        );
    }

    // Desktop list layout
    return (
        <List dense={isTablet}>
            {contacts.map(contact => (
                <RecordContextProvider key={contact.id} value={contact}>
                    <ListItem disablePadding>
                        <ListItemButton
                            component={Link}
                            to={`/contacts/${contact.id}/show`}
                            sx={{
                                py: { sm: 1, md: 1.5 },
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '2.5em' }}>
                                <Checkbox
                                    edge="start"
                                    checked={selectedIds.includes(contact.id)}
                                    tabIndex={-1}
                                    disableRipple
                                    onClick={e => {
                                        e.stopPropagation();
                                        onToggleItem(contact.id);
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemAvatar>
                                <Avatar />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography 
                                        variant={isTablet ? 'body2' : 'body1'}
                                        fontWeight={500}
                                    >
                                        {contact.first_name} {contact.last_name ?? ''}
                                    </Typography>
                                }
                                secondary={
                                    <Box component="span">
                                        {contact.title}
                                        {contact.title && contact.company_id != null && ' at '}
                                        {contact.company_id != null && (
                                            <ReferenceField
                                                source="company_id"
                                                reference="companies"
                                                link={false}
                                            >
                                                <TextField source="name" />
                                            </ReferenceField>
                                        )}
                                        {contact.nb_tasks
                                            ? ` - ${contact.nb_tasks} task${
                                                  contact.nb_tasks > 1 ? 's' : ''
                                              }`
                                            : ''}
                                        <Box component="span" ml={1}>
                                            <TagsList />
                                        </Box>
                                    </Box>
                                }
                            />
                            {contact.last_seen && (
                                <ListItemSecondaryAction
                                    sx={{
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        right: { sm: 8, md: 16 }
                                    }}
                                >
                                    <Typography
                                        variant={isTablet ? 'caption' : 'body2'}
                                        color="text.secondary"
                                        title={contact.last_seen}
                                        sx={{ textAlign: 'right' }}
                                    >
                                        {!isTablet && 'last activity '}
                                        {formatRelative(contact.last_seen, now)}
                                        <Box component="span" ml={0.5}>
                                            <Status status={contact.status} />
                                        </Box>
                                    </Typography>
                                </ListItemSecondaryAction>
                            )}
                        </ListItemButton>
                    </ListItem>
                </RecordContextProvider>
            ))}

            {contacts.length === 0 && (
                <ListItem>
                    <ListItemText 
                        primary={
                            <Typography color="text.secondary" textAlign="center">
                                No contacts found
                            </Typography>
                        } 
                    />
                </ListItem>
            )}
        </List>
    );
};
