import { ColumnType, Generated } from 'kysely';

export interface ElectionTable {
    id: Generated<number>;
    type: 'presidential' | 'general';
    country: string;
    name: string;
    date: string;
    electorate: number;
    turnout: number;
    flag_url: string | null;
    created_at: ColumnType<Date, never, never>;
}
