import { Candidate, Election } from '@/database/schema/index.js';

export type ElectionMetadata = {
    [key: string]: {
        election: Election | null;
        candidates: Candidate[] | null;
    };
};
