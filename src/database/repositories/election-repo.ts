import { Repo } from '@/models/repo.js';
import { Kysely } from 'kysely';
import { Database, Election, NewElection } from '../schema/index.js';

export class ElectionRepo implements Repo {
    constructor(private readonly db: Kysely<Database>) {}

    public async getAll(): Promise<Election[]> {
        return await this.db.selectFrom('election').selectAll().execute();
    }

    public async getById(id: number): Promise<Election[]> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        return await this.db.selectFrom('election').selectAll().where('id', '=', id).execute();
    }

    public async create(data: NewElection): Promise<number> {
        const result = await this.db.insertInto('election').values(data).executeTakeFirst();

        return Number(result.numInsertedOrUpdatedRows);
    }
}
