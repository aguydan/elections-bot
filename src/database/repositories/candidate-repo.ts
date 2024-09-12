import { Repo } from './index.js';
import { Kysely } from 'kysely';
import { Database } from '../schema/index.js';
import { OperationWrapper } from '@/models/operation-wrapper.js';

export class CandidateRepo implements Repo {
    constructor(private readonly db: Kysely<Database>) {}

    public async getAll(): Promise<OperationWrapper<'candidate', 'select'>[]> {
        return await this.db.selectFrom('candidate').selectAll().execute();
    }

    public async getById(id: number): Promise<OperationWrapper<'candidate', 'select'>[]> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        return await this.db.selectFrom('candidate').selectAll().where('id', '=', id).execute();
    }

    public async create(data: OperationWrapper<'candidate', 'insert'>): Promise<number> {
        const result = await this.db.insertInto('candidate').values(data).executeTakeFirst();

        return Number(result.numInsertedOrUpdatedRows);
    }

    public async update(
        id: number,
        data: OperationWrapper<'candidate', 'update'>
    ): Promise<number> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        const result = await this.db
            .updateTable('candidate')
            .set(data)
            .where('id', '=', id)
            .executeTakeFirst();

        return Number(result.numUpdatedRows);
    }

    public async delete(id: number): Promise<number> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        const result = await this.db
            .deleteFrom('candidate')
            .where('id', '=', id)
            .executeTakeFirst();

        return Number(result.numDeletedRows);
    }
}
