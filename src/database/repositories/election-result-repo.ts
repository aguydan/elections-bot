import { Repo } from './index.js';
import { Kysely } from 'kysely';
import { Database } from '../schema/index.js';
import { OperationWrapper } from '@/models/operation-wrapper.js';

export class ElectionResultRepo implements Repo {
    constructor(private readonly db: Kysely<Database>) {}

    public async getAll({
        electionId,
        candidateId,
    }: {
        electionId?: number;
        candidateId?: number;
    }): Promise<OperationWrapper<'election_result', 'select'>[]> {
        if (electionId) {
            return await this.db
                .selectFrom('election_result')
                .selectAll()
                .where('election_id', '=', electionId)
                .execute();
        } else if (candidateId) {
            return await this.db
                .selectFrom('election_result')
                .selectAll()
                .where('candidate_id', '=', candidateId)
                .execute();
        } else {
            return await this.db.selectFrom('election_result').selectAll().execute();
        }
    }

    public async getById(id: number): Promise<OperationWrapper<'election_result', 'select'>[]> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        return await this.db
            .selectFrom('election_result')
            .selectAll()
            .where('id', '=', id)
            .execute();
    }

    public async create(data: OperationWrapper<'election_result', 'insert'>): Promise<number> {
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
