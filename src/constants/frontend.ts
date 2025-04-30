import Config from '@/../config/config.json';

const { protocol, hostname, port } = Config.frontend;

export const FRONTEND_PATH = `${protocol}://${hostname}:${port}`;
