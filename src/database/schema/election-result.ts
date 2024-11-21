import { ColumnType, Generated, Insertable, Selectable } from 'kysely';
import { Candidate } from './index.js';
import { PartialNull } from '@/models/partial-null.js';

export interface ElectionResultTable {
    id: Generated<number>;
    popular_vote: number;
    percentage: number;
    seats_won: number | null;
    swing: number | null;
    created_at: ColumnType<Date, Date, never>;
    candidate_id: number;
    held_election_id: number;
}

export type ElectionResult = Selectable<
    ElectionResultTable &
        PartialNull<
            Pick<Candidate, 'color' | 'party' | 'image_url'> & {
                candidate_name: string;
            }
        >
>;
export type NewElectionResult = Insertable<ElectionResultTable>;
