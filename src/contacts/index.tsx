/* eslint-disable import/no-anonymous-default-export */
import { ContactShow } from './ContactShow';
import { ContactList } from './ContactList';
import { ContactEdit } from './ContactEdit';
import { ContactCreate } from './ContactCreate';
import { Contact } from '../types';

// Export new components for external use
export { ContactBusinessInsights } from './ContactBusinessInsights';
export { PropertyManagementSection } from './PropertyManagementSection';
export { QuickActionsPanel } from './QuickActionsPanel';
export { CommunicationTimeline } from './CommunicationTimeline';

export default {
    list: ContactList,
    show: ContactShow,
    edit: ContactEdit,
    create: ContactCreate,
    recordRepresentation: (record: Contact) =>
        record?.first_name + ' ' + record?.last_name,
};
