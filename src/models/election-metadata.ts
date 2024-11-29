import { Candidate, Election } from '@/database/schema/index.js';

export type ElectionMetadata = {
    [key: string]: {
        election: Election | null;
        candidates: Candidate[] | null;
    };
};

//IT SHOULD BE A CLASS ON THE BOT CLASS!!!!
