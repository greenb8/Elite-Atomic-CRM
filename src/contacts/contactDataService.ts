import { 
    BusinessInsight, 
    Property, 
    CommunicationEvent, 
    SeasonalRevenue,
    Contact,
    Deal,
    Task,
    ContactNote
} from '../types';
import { Identifier, DataProvider } from 'react-admin';

export class ContactDataService {
    /**
     * Fetch business insights for a contact
     */
    static async getBusinessInsights(contactId: Identifier, dataProvider: DataProvider): Promise<BusinessInsight[]> {
        try {
            // Fetch deals for this contact
            const { data: deals } = await dataProvider.getList('deals', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'created_at', order: 'DESC' },
                filter: { contact_ids: [contactId] },
            });

            // Fetch tasks for this contact
            const { data: tasks } = await dataProvider.getList('tasks', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'due_date', order: 'ASC' },
                filter: { contact_id: contactId },
            });

            // Calculate metrics
            const totalRevenue = deals.reduce((sum: number, deal: Deal) => sum + (deal.amount || 0), 0);
            const completedDeals = deals.filter((deal: Deal) => deal.stage === 'Won').length;
            const averageProjectSize = completedDeals > 0 ? totalRevenue / completedDeals : 0;
            const pendingTasks = tasks.filter((task: Task) => !task.done_date).length;
            
            // Get next scheduled service from tasks
            const nextService = tasks.find((task: Task) => !task.done_date && task.type === 'service');
            const nextServiceDate = nextService ? new Date(nextService.due_date).toLocaleDateString() : 'Not scheduled';

            // Calculate seasonal revenue (mock for now - would need date analysis)
            const currentYear = new Date().getFullYear();
            const thisYearDeals = deals.filter((deal: Deal) => 
                new Date(deal.created_at).getFullYear() === currentYear
            );

            return [
                {
                    id: 'lifetime-value',
                    label: 'Lifetime Value',
                    value: `$${totalRevenue.toLocaleString()}`,
                    icon: () => null, // Will be replaced in component
                    color: '#4caf50',
                    trend: 'up',
                    trendValue: '+12%'
                },
                {
                    id: 'projects-completed',
                    label: 'Projects Completed',
                    value: completedDeals,
                    icon: () => null,
                    color: '#2196f3'
                },
                {
                    id: 'avg-project-size',
                    label: 'Avg Project Size',
                    value: `$${Math.round(averageProjectSize).toLocaleString()}`,
                    icon: () => null,
                    color: '#ff9800'
                },
                {
                    id: 'next-service',
                    label: 'Next Service',
                    value: nextServiceDate,
                    icon: () => null,
                    color: '#9c27b0'
                },
                {
                    id: 'pending-tasks',
                    label: 'Pending Tasks',
                    value: pendingTasks,
                    icon: () => null,
                    color: pendingTasks > 0 ? '#f44336' : '#4caf50'
                }
            ];
        } catch (error) {
            console.error('Error fetching business insights:', error);
            return [];
        }
    }

    /**
     * Fetch properties for a contact
     */
    static async getProperties(contactId: Identifier, dataProvider: DataProvider): Promise<Property[]> {
        try {
            const { data: properties } = await dataProvider.getList('properties', {
                pagination: { page: 1, perPage: 100 },
                sort: { field: 'created_at', order: 'DESC' },
                filter: { contact_id: contactId },
            });

            // Fetch jobs for each property to get service info
            const propertiesWithJobs = await Promise.all(
                properties.map(async (property: any) => {
                    try {
                        const { data: jobs } = await dataProvider.getList('jobs', {
                            pagination: { page: 1, perPage: 10 },
                            sort: { field: 'scheduled_at', order: 'DESC' },
                            filter: { property_id: property.id },
                        });

                        const lastJob = jobs.find((job: any) => job.status === 'Completed');
                        const nextJob = jobs.find((job: any) => job.status === 'Scheduled');

                        return {
                            id: property.id.toString(),
                            name: property.name || `Property ${property.id}`,
                            address: [property.address, property.city, property.state, property.zipcode]
                                .filter(Boolean)
                                .join(', '),
                            size: property.property_size || 'Unknown',
                            type: 'residential' as const,
                            status: nextJob ? 'active' as const : 'inactive' as const,
                            lastService: lastJob ? new Date(lastJob.completed_at || lastJob.scheduled_at).toLocaleDateString() : 'Never',
                            nextService: nextJob ? new Date(nextJob.scheduled_at).toLocaleDateString() : 'Not scheduled',
                            assignedCrew: 'Main Crew', // This would come from jobs.assigned_to_id lookup
                            images: property.photos_paths || [],
                            issues: [], // Would need separate issues table
                            notes: property.notes || ''
                        };
                    } catch (error) {
                        console.error(`Error fetching jobs for property ${property.id}:`, error);
                        return {
                            id: property.id.toString(),
                            name: property.name || `Property ${property.id}`,
                            address: [property.address, property.city, property.state, property.zipcode]
                                .filter(Boolean)
                                .join(', '),
                            size: 'Unknown',
                            type: 'residential' as const,
                            status: 'inactive' as const,
                            lastService: 'Never',
                            nextService: 'Not scheduled',
                            assignedCrew: 'Unassigned',
                            images: property.photos_paths || [],
                            issues: [],
                            notes: property.notes || ''
                        };
                    }
                })
            );

            return propertiesWithJobs;
        } catch (error) {
            console.error('Error fetching properties:', error);
            return [];
        }
    }

    /**
     * Fetch communication timeline for a contact
     */
    static async getCommunicationTimeline(contactId: Identifier, dataProvider: DataProvider): Promise<CommunicationEvent[]> {
        try {
            // Fetch contact notes
            const { data: notes } = await dataProvider.getList('contactNotes', {
                pagination: { page: 1, perPage: 100 },
                sort: { field: 'date', order: 'DESC' },
                filter: { contact_id: contactId },
            });

            // Fetch tasks related to communication
            const { data: tasks } = await dataProvider.getList('tasks', {
                pagination: { page: 1, perPage: 100 },
                sort: { field: 'due_date', order: 'DESC' },
                filter: { contact_id: contactId },
            });

            const events: CommunicationEvent[] = [];

            // Convert notes to communication events
            notes.forEach((note: ContactNote) => {
                events.push({
                    id: `note-${note.id}`,
                    type: 'note',
                    title: 'Contact Note',
                    description: note.text,
                    date: note.date,
                    priority: note.status === 'Hot' ? 'high' : note.status === 'Warm' ? 'medium' : 'low',
                    status: 'completed',
                    attachments: note.attachments?.map((att: any) => att.src) || []
                });
            });

            // Convert tasks to communication events
            tasks.forEach((task: Task) => {
                const isCompleted = !!task.done_date;
                const isPastDue = !isCompleted && new Date(task.due_date) < new Date();
                
                events.push({
                    id: `task-${task.id}`,
                    type: task.type === 'call' ? 'call' : task.type === 'email' ? 'email' : 'note',
                    title: task.type.charAt(0).toUpperCase() + task.type.slice(1),
                    description: task.text,
                    date: task.due_date,
                    priority: isPastDue ? 'high' : 'medium',
                    status: isCompleted ? 'completed' : isPastDue ? 'follow_up_required' : 'pending'
                });
            });

            // Sort by date (most recent first)
            return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (error) {
            console.error('Error fetching communication timeline:', error);
            return [];
        }
    }

    /**
     * Get seasonal revenue data for a contact
     */
    static async getSeasonalRevenue(contactId: Identifier, dataProvider: DataProvider): Promise<SeasonalRevenue[]> {
        try {
            const { data: deals } = await dataProvider.getList('deals', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'created_at', order: 'DESC' },
                filter: { contact_ids: [contactId] },
            });

            const completedDeals = deals.filter((deal: Deal) => deal.stage === 'Won');
            const totalRevenue = completedDeals.reduce((sum: number, deal: Deal) => sum + (deal.amount || 0), 0);

            // Group deals by season based on created_at date
            const seasonalData = {
                Spring: 0,
                Summer: 0,
                Fall: 0,
                Winter: 0
            };

            completedDeals.forEach((deal: Deal) => {
                const month = new Date(deal.created_at).getMonth();
                if (month >= 2 && month <= 4) seasonalData.Spring += deal.amount || 0;
                else if (month >= 5 && month <= 7) seasonalData.Summer += deal.amount || 0;
                else if (month >= 8 && month <= 10) seasonalData.Fall += deal.amount || 0;
                else seasonalData.Winter += deal.amount || 0;
            });

            return Object.entries(seasonalData).map(([season, revenue]) => ({
                season: season as 'Spring' | 'Summer' | 'Fall' | 'Winter',
                revenue,
                percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0
            }));
        } catch (error) {
            console.error('Error fetching seasonal revenue:', error);
            return [
                { season: 'Spring', revenue: 0, percentage: 0 },
                { season: 'Summer', revenue: 0, percentage: 0 },
                { season: 'Fall', revenue: 0, percentage: 0 },
                { season: 'Winter', revenue: 0, percentage: 0 }
            ];
        }
    }

    /**
     * Get quick actions for a contact
     */
    static getQuickActions(contactId: Identifier) {
        return [
            {
                id: 'schedule-service',
                label: 'Schedule Service',
                icon: () => null,
                color: '#4caf50',
                action: () => {
                    // Navigate to job creation with contact pre-filled
                    window.location.hash = `#/jobs/create?contact_id=${contactId}`;
                }
            },
            {
                id: 'generate-quote',
                label: 'Generate Quote',
                icon: () => null,
                color: '#2196f3',
                action: () => {
                    // Navigate to proposal creation
                    window.location.hash = `#/proposals/create?contact_id=${contactId}`;
                }
            },
            {
                id: 'create-invoice',
                label: 'Create Invoice',
                icon: () => null,
                color: '#ff9800',
                action: () => {
                    // Navigate to deal creation for invoicing
                    window.location.hash = `#/deals/create?contact_id=${contactId}`;
                }
            },
            {
                id: 'send-update',
                label: 'Send Update',
                icon: () => null,
                color: '#9c27b0',
                action: () => {
                    // Navigate to contact note creation
                    window.location.hash = `#/contactNotes/create?contact_id=${contactId}`;
                }
            },
            {
                id: 'add-photos',
                label: 'Add Photos',
                icon: () => null,
                color: '#795548',
                action: () => {
                    // Open photo upload dialog (would need implementation)
                    console.log('Photo upload for contact:', contactId);
                }
            },
            {
                id: 'service-report',
                label: 'Service Report',
                icon: () => null,
                color: '#607d8b',
                action: () => {
                    // Navigate to task creation for service report
                    window.location.hash = `#/tasks/create?contact_id=${contactId}&type=service_report`;
                }
            }
        ];
    }
}
