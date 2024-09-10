import { Repo } from '@/models/repo.js';
import { Kysely } from 'kysely';
import { Candidate, Database, NewCandidate } from '../schema/index.js';

export class CandidateRepo implements Repo {
    constructor(private readonly db: Kysely<Database>) {}

    public async getAll(): Promise<Candidate[]> {
        return await this.db.selectFrom('candidate').selectAll().execute();
    }

    public async getById(id: number): Promise<Candidate[]> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        return await this.db.selectFrom('candidate').selectAll().where('id', '=', id).execute();
    }

    public async create(data: NewCandidate): Promise<number> {
        const result = await this.db.insertInto('candidate').values(data).executeTakeFirst();

        return Number(result.numInsertedOrUpdatedRows);
    }
}
