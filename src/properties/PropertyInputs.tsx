import { Grid } from '@mui/material';
import { 
    AutocompleteInput, 
    ImageField, 
    ImageInput, 
    ReferenceInput, 
    TextInput 
} from 'react-admin';

export default function PropertyInputs() {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <TextInput source="name" fullWidth label="Property Name" />
            </Grid>
            <Grid item xs={12} md={6}>
                <ReferenceInput source="contact_id" reference="contacts">
                    <AutocompleteInput
                        optionText="last_name"
                        fullWidth
                        label="Primary Contact"
                    />
                </ReferenceInput>
            </Grid>
            <Grid item xs={12}>
                <TextInput source="address" fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextInput source="city" fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextInput source="state" fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextInput source="zipcode" fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput source="country" fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput source="gate_code" fullWidth />
            </Grid>
            <Grid item xs={12}>
                <TextInput source="access_notes" fullWidth multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
                <TextInput source="notes" fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12}>
                <ImageInput source="photos_paths" label="Property Photos" multiple>
                    <ImageField source="src" title="title" />
                </ImageInput>
            </Grid>
            <Grid item xs={12}>
                <ImageInput source="google_photos_paths" label="Google Photos" multiple>
                    <ImageField source="src" title="title" />
                </ImageInput>
            </Grid>
        </Grid>
    );
}