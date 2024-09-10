import { Repo } from '@/models/repo.js';
import { Kysely } from 'kysely';
import { Database, ElectionResult, NewElectionResult } from '../schema/index.js';

export class ElectionResultRepo implements Repo {
    constructor(private readonly db: Kysely<Database>) {}

    public async getAll(): Promise<ElectionResult[]> {
        return await this.db.selectFrom('election_result').selectAll().execute();
    }

    public async getById(id: number): Promise<ElectionResult[]> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        return await this.db
            .selectFrom('election_result')
            .selectAll()
            .where('id', '=', id)
            .execute();
    }

    public async create(data: NewElectionResult): Promise<number> {
        const result = await this.db.insertInto('election_result').values(data).executeTakeFirst();

        return Number(result.numInsertedOrUpdatedRows);
    }
}