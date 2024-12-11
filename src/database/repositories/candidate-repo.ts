import { Repo } from './index.js';
import { Kysely } from 'kysely';
import { Candidate, CandidateUpdate, Database, NewCandidate } from '../schema/index.js';

export class CandidateRepo implements Repo {
    //check id function??
    constructor(private readonly db: Kysely<Database>) {}

    public async getAll(): Promise<Candidate[]> {
        return await this.db.selectFrom('candidate').selectAll().execute();
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
