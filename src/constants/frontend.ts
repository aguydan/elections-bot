import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

const { protocol, hostname, port } = Config.frontend;

export const FRONTEND_PATH = `${protocol}://${hostname}:${port}`;
