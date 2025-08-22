import { Edit, SimpleForm } from 'react-admin';
import JobInputs from './JobInputs';

export default function JobEdit() {
    return (
        <Edit>
            <SimpleForm>
                <JobInputs />
            </SimpleForm>
        </Edit>
    );
}
