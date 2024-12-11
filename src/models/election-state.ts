import { Candidate, Election } from '@/database/schema/index.js';

export type ElectionStateValue = {
    election?: Election;
    candidates?: Candidate[];
};

export type ElectionState = Map<string, ElectionStateValue>;
