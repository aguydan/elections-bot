import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

const { protocol, hostname, port, uploadsDir } = Config.api;

export const API_PATH = `${protocol}://${hostname}:${port}`;
export const UPLOADS_PATH = `${protocol}://${hostname}:${port}/${uploadsDir}`;
