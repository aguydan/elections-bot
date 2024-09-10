import { ColumnType, Generated, Insertable, Selectable } from 'kysely';

export interface ElectionTable {
    id: Generated<number>;
    type: 'presidential' | 'general';
    country: string;
    name: string;
    date: string | null;
    electorate: number;
    turnout: number | null;
    flag_url: string | null;
    created_at: ColumnType<Date, Date, never>;
}

export type Election = Selectable<ElectionTable>;
export type NewElection = Insertable<ElectionTable>;
