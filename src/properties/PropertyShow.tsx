import { Divider, Typography } from '@mui/material';
import {
    ArrayField,
    Datagrid,
    DateField,
    ImageField,
    NumberField,
    ReferenceManyField,
    Show,
    SimpleShowLayout,
    SingleFieldList,
    TextField,
    useRecordContext,
} from 'react-admin';
import StreetViewImage from '../misc/StreetViewImage';

export default function PropertyShow() {
    const record = useRecordContext<any>();
    return (
        <Show>
            <SimpleShowLayout>
                {record?.address ? (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Street View
                        </Typography>
                        <StreetViewImage
                            address={record.address}
                            city={record.city}
                            state={record.state}
                            zipcode={record.zipcode}
                            size={{ width: 600, height: 400 }}
                            fov={90}
                            heading={0}
                            pitch={0}
                        />
                        <Divider sx={{ my: 2 }} />
                    </>
                ) : null}
                <TextField source="name" />
                <TextField source="contact_name" label="Contact" />
                <TextField source="address" />
                <TextField source="city" />
                <TextField source="state" />
                <TextField source="zipcode" />
                <TextField source="country" />
                <TextField source="gate_code" />
                <TextField source="access_notes" />
                <TextField source="notes" />
                <DateField source="created_at" />

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                    Property Photos
                </Typography>
                <ArrayField source="photos_paths">
                    <SingleFieldList>
                        <ImageField source="src" title="title" />
                    </SingleFieldList>
                </ArrayField>

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                    Google Photos
                </Typography>
                <ArrayField source="google_photos_paths">
                    <SingleFieldList>
                        <ImageField source="src" title="title" />
                    </SingleFieldList>
                </ArrayField>

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                    Related Deals
                </Typography>
                <ReferenceManyField reference="deals" target="property_id">
                    <Datagrid rowClick="show">
                        <TextField source="name" />
                        <NumberField source="amount" />
                        <DateField source="created_at" />
                    </Datagrid>
                </ReferenceManyField>
            </SimpleShowLayout>
        </Show>
    );
}
