import { ColumnType, Generated, Insertable, Selectable } from 'kysely';
import { Candidate, Election } from './index.js';
import { PartialNull } from '@/models/partial-null.js';

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

export type ElectionResult = Selectable<
    ElectionResultTable &
        PartialNull<
            Pick<Candidate, 'color' | 'party'> &
                Pick<Election, 'type' | 'country' | 'date'> & {
                    candidate_name: string;
                    election_name: string;
                }
        >
>;
export type NewElectionResult = Insertable<ElectionResultTable>;
