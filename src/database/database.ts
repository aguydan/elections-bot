import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { createRequire } from 'node:module';
import { Database } from './models/index.js';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

const dialect = new PostgresDialect({
    pool: new Pool({
        ...Config.database,
    }),
});

export const db = new Kysely<Database>({
    dialect,
});
