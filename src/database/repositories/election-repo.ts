import { Repo } from './index.js';
import { Kysely } from 'kysely';
import { Database, Election, ElectionUpdate, NewElection } from '../schema/index.js';

export class ElectionRepo implements Repo {
    constructor(private readonly db: Kysely<Database>) {}

    public async getAll(): Promise<Election[]> {
        return await this.db.selectFrom('election').selectAll().execute();
    }

    public async getById(id: number): Promise<Election> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        const election = await this.db
            .selectFrom('election')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        if (!election) {
            throw new Error(`No row with the ID ${id} exists in the table.`);
        }

        return election;
    }

    public async create(data: NewElection): Promise<number> {
        const result = await this.db.insertInto('election').values(data).executeTakeFirst();

        return Number(result.numInsertedOrUpdatedRows);
    }

    public async update(id: number, data: ElectionUpdate): Promise<number> {
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
