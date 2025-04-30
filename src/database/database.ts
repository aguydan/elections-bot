import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './schema/index.js';
import {
  CandidateRepo,
  ElectionRepo,
  ElectionResultRepo,
  HeldElectionRepo,
} from './repositories/index.js';
import Config from '@/../config/config.json';

/*
 * This is needed because database queries return
 * NUMERIC fields as strings by default instead of numbers
 */
const types = pg.types;
types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));

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
export const electionResultRepo = new ElectionResultRepo(db);
export const heldElectionRepo = new HeldElectionRepo(db);
