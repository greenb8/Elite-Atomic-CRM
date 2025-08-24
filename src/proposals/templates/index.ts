/* eslint-disable import/no-anonymous-default-export */
import { ProposalTemplateShow } from './ProposalTemplateShow';
import { ProposalTemplateList } from './ProposalTemplateList';
import { ProposalTemplateEdit } from './ProposalTemplateEdit';
import { ProposalTemplateCreate } from './ProposalTemplateCreate';
import { ProposalTemplate } from '../../types';

export default {
    list: ProposalTemplateList,
    show: ProposalTemplateShow,
    edit: ProposalTemplateEdit,
    create: ProposalTemplateCreate,
    recordRepresentation: (record: ProposalTemplate) => record?.name,
};
