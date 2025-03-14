import { ColumnType, Generated, Insertable, JSONColumnType, Selectable, Updateable } from 'kysely';

/* export interface CandidateScore {
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
} */

export interface CandidateTable {
    id: Generated<number>;
    name: string;
    color: string;
    origin: string | null;
    running_mate: string | null;
    party: string | null;
    image_url: string | null;
    score: JSONColumnType<Record<string, number>>;
    created_at: ColumnType<Date, never, never>;
    updated_at: ColumnType<Date | null, never, Date>;
}

export type Candidate = Selectable<CandidateTable>;
export type NewCandidate = Insertable<CandidateTable>;
export type CandidateUpdate = Updateable<CandidateTable>;
