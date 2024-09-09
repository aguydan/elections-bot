import { RootController } from './controllers/index.js';
import { API } from './models/api.js';

async function start(): Promise<void> {
    const rootController = new RootController();
    const api = new API([rootController]);

    await api.start();
}

process.on('unhandledRejection', (reason, _promise) => {
    console.log('unhandled rejection' + reason);
});

start().catch(error => console.log(error));
