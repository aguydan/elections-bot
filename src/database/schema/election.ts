import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

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
    updated_at: ColumnType<Date | null, never, Date>;
}

export type Election = Selectable<ElectionTable>;
export type NewElection = Insertable<ElectionTable>;
export type ElectionUpdate = Updateable<ElectionTable>;
