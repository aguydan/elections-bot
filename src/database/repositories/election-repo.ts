import { Repo } from './index.js';
import { Kysely } from 'kysely';
import { Database } from '../schema/index.js';
import { OperationWrapper } from '@/models/operation-wrapper.js';

export class ElectionRepo implements Repo {
    constructor(private readonly db: Kysely<Database>) {}

    public async getAll(): Promise<OperationWrapper<'election', 'select'>[]> {
        return await this.db.selectFrom('election').selectAll().execute();
    }

    public async getById(id: number): Promise<OperationWrapper<'election', 'select'>[]> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        return await this.db.selectFrom('election').selectAll().where('id', '=', id).execute();
    }

    public async create(data: OperationWrapper<'election', 'insert'>): Promise<number> {
        const result = await this.db.insertInto('election').values(data).executeTakeFirst();

        return Number(result.numInsertedOrUpdatedRows);
    }

    public async update(id: number, data: OperationWrapper<'election', 'update'>): Promise<number> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        const result = await this.db
            .updateTable('election')
            .set(data)
            .where('id', '=', id)
            .executeTakeFirst();

        return Number(result.numUpdatedRows);
    }

    public async delete(id: number): Promise<number> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        const result = await this.db.deleteFrom('election').where('id', '=', id).executeTakeFirst();

        return Number(result.numDeletedRows);
    }
}
