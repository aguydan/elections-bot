import { ColumnType, Generated, Insertable, JSONColumnType, Selectable } from 'kysely';

export interface CandidateScore {
    gdp: number;
    party_relevance: number;
    program_relevance: number;
    charisma: number;
    popularity: number;
    landowners_support: number;
    workers_support: number;
    intelligentsia_support: number;
    army_support: number;
    devout_support: number;
    capital_favorite: number;
    propaganda_campaign: number;
}

export interface CandidateTable {
    id: Generated<number>;
    name: string;
    color: string;
    origin: string | null;
    running_mate: string | null;
    party: string | null;
    score: JSONColumnType<CandidateScore>;
    created_at: ColumnType<Date, Date, never>;
    updated_at: ColumnType<Date | null, never, Date>;
    election_id: number | null;
}

export type Candidate = Selectable<CandidateTable>;
export type NewCandidate = Insertable<CandidateTable>;
