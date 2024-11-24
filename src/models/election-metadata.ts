import { Candidate, Election } from '@/database/schema/index.js';

export type ElectionMetadata = Record<string, { election?: Election; candidates?: Candidate[] }>;
