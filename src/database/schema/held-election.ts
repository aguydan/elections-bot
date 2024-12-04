import { ColumnType, Generated, Insertable, Selectable } from 'kysely';
import { Election } from './index.js';
import { PartialNull } from '@/models/utility-types.js';

export interface HeldElectionTable {
    id: Generated<number>;
    created_at: ColumnType<Date, Date, never>;
    election_id: number;
}

export type HeldElection = Selectable<
    HeldElectionTable &
        PartialNull<
            Pick<Election, 'type' | 'country' | 'date' | 'flag_url'> & {
                election_name: string;
            }
        >
>;
export type NewHeldElection = Insertable<HeldElectionTable>;
