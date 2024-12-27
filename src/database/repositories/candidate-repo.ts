import { Repo } from './index.js';
import { Kysely } from 'kysely';
import { Candidate, CandidateUpdate, Database, NewCandidate } from '../schema/index.js';

export class CandidateRepo implements Repo {
    //check id function??
    constructor(private readonly db: Kysely<Database>) {}

    public async getAll(): Promise<Candidate[]> {
        return await this.db.selectFrom('candidate').selectAll().execute();
    }

    //this looks like a general search function but without likes or regexp so theres room for improvement
    public async getSome(
        params: { limit?: number; offset?: number } & Partial<Candidate>
    ): Promise<Candidate[]> {
        if (!params.limit) {
            console.warn('Limit was not provided');
        }

        const limit = params.limit ?? 0;
        const offset = params.offset ?? 0;

        return await this.db
            .selectFrom('candidate')
            .selectAll()
            .orderBy('name asc')
            .limit(limit)
            .offset(offset)
            .execute();
    }

    public async count(): Promise<{ count: number | string | bigint }> {
        const count = await this.db
            .selectFrom('candidate')
            .select(({ fn }) => fn.count('id').as('count'))
            .executeTakeFirst();

        if (!count) {
            return { count: 0 };
        }

        return count;
    }

    public async getById(id: number): Promise<Candidate> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        const candidate = await this.db
            .selectFrom('candidate')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        if (!candidate) {
            throw new Error(`No row with the ID ${id} exists in the table.`);
        }

        return candidate;
    }

    //replace this with the general getSome function at the beginning
    public async searchByName(name: string): Promise<Pick<Candidate, 'id' | 'name'>[]> {
        return await this.db
            .selectFrom('candidate')
            .select(['id', 'name'])
            .where('name', '~*', `.*${name}.*`)
            .execute();
    }

    public async create(data: NewCandidate): Promise<number> {
        const result = await this.db.insertInto('candidate').values(data).executeTakeFirst();

        return Number(result.numInsertedOrUpdatedRows);
    }

    public async update(id: number, data: CandidateUpdate): Promise<number> {
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

    public async updateScore(id: number, score: Record<string, number>): Promise<number> {
        const result = await this.db
            .updateTable('candidate')
            .set({
                score: JSON.stringify(score),
            })
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
