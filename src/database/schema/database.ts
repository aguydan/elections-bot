import { CandidateTable, ElectionResultTable, ElectionTable } from './index.js';

export interface Database {
    candidate: CandidateTable;
    election: ElectionTable;
    election_result: ElectionResultTable;
}
