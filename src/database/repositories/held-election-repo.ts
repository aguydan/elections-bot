import { Repo } from './index.js';
import { Kysely } from 'kysely';
import { Database, HeldElection, NewHeldElection } from '../schema/index.js';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export class HeldElectionRepo implements Repo {
    constructor(private readonly db: Kysely<Database>) {}

    public async getLatest(): Promise<HeldElection> {
        const heldElection = await this.db
            .selectFrom('held_election as h')
            .leftJoin('election as e', 'h.election_id', 'e.id')
            .selectAll('h')
            .select(['e.name as election_name', 'e.type', 'e.country', 'e.date', 'e.flag_url'])
            .select(eb => [
                jsonArrayFrom(
                    eb
                        .selectFrom('election_result as r')
                        .leftJoin('candidate as c', 'r.candidate_id', 'c.id')
                        .selectAll('r')
                        .select(['c.name as candidate_name', 'c.color', 'c.party', 'c.image_url'])
                        .whereRef('h.id', '=', 'r.held_election_id')
                        .orderBy('r.percentage desc')
                ).as('results'),
            ])
            .orderBy('h.created_at desc')
            .executeTakeFirst();

        if (!heldElection) {
            throw new Error('No rows in the table.');
        }

        return heldElection;
    }

    public async create(data: NewHeldElection): Promise<number> {
        const heldElection = await this.db
            .insertInto('held_election')
            .values(data)
            .returning('id')
            .executeTakeFirst();

        if (!heldElection) {
            throw new Error('Something went wrong while inserting data');
        }

        return heldElection.id;
    }

    public async delete(id: number): Promise<number> {
        if (Number.isNaN(id)) {
            throw new Error('Invalid ID in request parameter. Must be an integer.');
        }

        const heldElection = await this.db
            .deleteFrom('held_election')
            .where('id', '=', id)
            .executeTakeFirst();

        return Number(heldElection.numDeletedRows);
    }
}
