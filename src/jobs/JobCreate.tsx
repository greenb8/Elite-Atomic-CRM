import { Create, SimpleForm } from 'react-admin';
import JobInputs from './JobInputs';

export default function JobCreate() {
    return (
        <Create>
            <SimpleForm>
                <JobInputs />
            </SimpleForm>
        </Create>
    );
}


