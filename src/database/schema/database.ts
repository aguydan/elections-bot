import { CandidateTable, ElectionResultTable, ElectionTable, HeldElectionTable } from './index.js';

export interface Database {
    candidate: CandidateTable;
    election: ElectionTable;
    election_result: ElectionResultTable;
    held_election: HeldElectionTable;
}
