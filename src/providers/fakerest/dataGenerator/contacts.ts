import {
    company as fakerCompany,
    internet,
    lorem,
    name,
    phone,
    random,
} from 'faker/locale/en_US';

import {
    defaultContactGender,
    defaultNoteStatuses,
} from '../../../root/defaultConfiguration';
import { Company, Contact } from '../../../types';
import { Db } from './types';
import { randomDate, weightedBoolean } from './utils';

const maxContacts = {
    1: 1,
    10: 4,
    50: 12,
    250: 25,
    500: 50,
};

const getRandomContactDetailsType = () =>
    random.arrayElement(['Work', 'Home', 'Other']) as 'Work' | 'Home' | 'Other';

export const generateContacts = (db: Db, size = 500): Required<Contact>[] => {
    const nbAvailblePictures = 223;
    let numberOfContacts = 0;

    return Array.from(Array(size).keys()).map(id => {
        const has_avatar =
            weightedBoolean(25) && numberOfContacts < nbAvailblePictures;
        const gender = random.arrayElement(defaultContactGender).value;
        const first_name = name.firstName(gender as any);
        const last_name = name.lastName();
        const email_jsonb = [
            {
                email: internet.email(first_name, last_name),
                type: getRandomContactDetailsType(),
            },
        ];
        const phone_jsonb = [
            {
                number: phone.phoneNumber(),
                type: getRandomContactDetailsType(),
            },
            {
                number: phone.phoneNumber(),
                type: getRandomContactDetailsType(),
            },
        ];
        const avatar = {
            src: has_avatar
                ? 'https://marmelab.com/posters/avatar-' +
                  (223 - numberOfContacts) +
                  '.jpeg'
                : undefined,
        };
        const title = fakerCompany.bsAdjective();

        if (has_avatar) {
            numberOfContacts++;
        }

        // choose company with people left to know
        let company: Required<Company>;
        do {
            company = random.arrayElement(db.companies);
        } while (company.nb_contacts >= maxContacts[company.size]);
        company.nb_contacts++;

        const first_seen = randomDate(
            new Date(company.created_at)
        ).toISOString();
        const last_seen = first_seen;

        return {
            id,
            first_name,
            last_name,
            gender,
            title: title.charAt(0).toUpperCase() + title.substr(1),
            company_id: company.id,
            company_name: company.name,
            email_jsonb,
            phone_jsonb,
            service_addresses_jsonb: [
                {
                    address: fakerCompany.companyName() + ' Property',
                    city: random.arrayElement(['Springfield', 'Madison', 'Franklin', 'Georgetown']),
                    state: random.arrayElement(['IL', 'CA', 'TX', 'NY']),
                    zipcode: random.arrayElement(['62701', '94043', '75201', '10001']),
                    type: random.arrayElement(['Primary Property', 'Secondary Property', 'Commercial Site']),
                    gate_code: weightedBoolean(30) ? random.arrayElement(['1234', '5678', '0000']) : null,
                    access_notes: weightedBoolean(40) ? lorem.sentence() : null,
                    property_size: weightedBoolean(50) ? random.arrayElement(['0.5 acres', '1 acre', '2 acres', '0.25 acres']) : null,
                    service_notes: weightedBoolean(60) ? lorem.sentence() : null,
                    lat: null,
                    lng: null,
                    migrated_from_single_address: false,
                }
            ],
            background: lorem.sentence(),
            acquisition: random.arrayElement(['inbound', 'outbound']),
            avatar,
            first_seen: first_seen,
            last_seen: last_seen,
            has_newsletter: weightedBoolean(30),
            status: random.arrayElement(defaultNoteStatuses).value,
            tags: random
                .arrayElements(db.tags, random.arrayElement([0, 0, 0, 1, 1, 2]))
                .map(tag => tag.id), // finalize
            sales_id: company.sales_id,
            nb_tasks: 0,
            linkedin_url: null,
            billing_address: null,
            billing_city: null,
            billing_state: null,
            billing_zipcode: null,
        };
    });
};
