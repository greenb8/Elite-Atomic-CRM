/* eslint-disable import/no-anonymous-default-export */
import { ProposalShow } from './ProposalShow';
import { ProposalList } from './ProposalList';
import { ProposalEdit } from './ProposalEdit';
import { ProposalCreate } from './ProposalCreate';
import { Proposal } from '../types';

export default {
    list: ProposalList,
    show: ProposalShow,
    edit: ProposalEdit,
    create: ProposalCreate,
    recordRepresentation: (record: Proposal) => record?.title,
};
