import { Repo } from './index.js';
import { Kysely } from 'kysely';
import { Database, ElectionResult, NewElectionResult } from '../schema/index.js';

export class ElectionResultRepo implements Repo {
    constructor(private readonly db: Kysely<Database>) {}

    public async getById(id: number): Promise<ElectionResult> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        const result = await this.db
            .selectFrom('election_result as r')
            .leftJoin('candidate as c', 'r.candidate_id', 'c.id')
            .leftJoin('election as e', 'r.election_id', 'e.id')
            .selectAll('r')
            .select([
                'e.type',
                'e.country',
                'e.name as election_name',
                'e.date',
                'c.name as candidate_name',
                'c.color',
                'c.party',
            ])
            .where('id', '=', id)
            .executeTakeFirst();

        if (!result) {
            throw new Error(`No row with the ID ${id} exists in the table.`);
        }

        return result;
    }

    public async search(params: Partial<ElectionResult>): Promise<ElectionResult[]> {
        return await this.db
            .selectFrom('election_result as r')
            .leftJoin('candidate as c', 'r.candidate_id', 'c.id')
            .leftJoin('election as e', 'r.election_id', 'e.id')
            .selectAll('r')
            .select([
                'e.type',
                'e.country',
                'e.name as election_name',
                'e.date',
                'c.name as candidate_name',
                'c.color',
                'c.party',
            ])
            .where(eb => eb.and(params))
            .execute();
    }

    public async create(data: NewElectionResult): Promise<number> {
        const result = await this.db.insertInto('election_result').values(data).executeTakeFirst();

        return Number(result.numInsertedOrUpdatedRows);
    }

    public async delete(id: number): Promise<number> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        const result = await this.db
            .deleteFrom('election_result')
            .where('id', '=', id)
            .executeTakeFirst();

        return Number(result.numDeletedRows);
    }
}
