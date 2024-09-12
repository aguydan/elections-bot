import { ColumnType, Generated } from 'kysely';

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
