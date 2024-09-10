import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { createRequire } from 'node:module';
import { Database } from './schema/index.js';
import { CandidateRepo, ElectionRepo } from './repositories/index.js';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

const dialect = new PostgresDialect({
    pool: new pg.Pool({
        ...Config.database,
    }),
});

export const db = new Kysely<Database>({
    dialect,
});

export const candidateRepo = new CandidateRepo(db);
export const electionRepo = new ElectionRepo(db);
