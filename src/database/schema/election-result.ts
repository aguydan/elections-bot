import { ColumnType, Generated, Insertable, Selectable } from 'kysely';

export interface ElectionResultTable {
    id: Generated<number>;
    popular_vote: number;
    percentage: number;
    seats_won: number | null;
    swing: number | null;
    created_at: ColumnType<Date, Date, never>;
    candidate_id: number;
    election_id: number;
}

export type ElectionResult = Selectable<ElectionResultTable>;
export type NewElectionResult = Insertable<ElectionResultTable>;
