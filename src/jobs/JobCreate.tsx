import { Create, SimpleForm, useRedirect } from 'react-admin';
import { useLocation } from 'react-router-dom';
import JobInputs from './JobInputs';
import { useEffect, useState } from 'react';

export default function JobCreate() {
    const location = useLocation();
    const redirect = useRedirect();
    const [initialValues, setInitialValues] = useState({});

    // Handle prefilled values from DealShow "Create Job" button
    useEffect(() => {
        if (location.state?.record) {
            setInitialValues(location.state.record);
        }
    }, [location.state]);

    // After successful creation, redirect to the calendar view
    const onSuccess = () => {
        redirect('list', 'jobs');
    };

    return (
        <Create>
            <SimpleForm 
                defaultValues={initialValues}
                onSuccess={onSuccess}
            >
                <JobInputs />
            </SimpleForm>
        </Create>
    );
}


