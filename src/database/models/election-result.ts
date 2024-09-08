import { ColumnType, Generated } from 'kysely';

export interface ElectionResultTable {
    id: Generated<number>;
    popular_vote: number;
    percentage: number;
    seats_won: number | null;
    swing: number | null;
    created_at: ColumnType<Date, never, never>;
    candidate_id: number;
    election_id: number;
}
