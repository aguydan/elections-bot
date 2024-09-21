import {
    CandidatesController,
    ElectionResultsController,
    ElectionsController,
    RootController,
    UploadsController,
} from './controllers/index.js';
import { API } from './models/api.js';

async function start(): Promise<void> {
    const rootController = new RootController();
    const uploadsController = new UploadsController();
    const electionResultsController = new ElectionResultsController();
    const candidatesController = new CandidatesController(electionResultsController.router);
    const electionsController = new ElectionsController(electionResultsController.router);
    const api = new API([
        rootController,
        uploadsController,
        electionsController,
        candidatesController,
        electionResultsController,
    ]);

    await api.start();
}

process.on('unhandledRejection', (reason, _promise) => {
    console.log('unhandled rejection ' + reason);
});

start().catch(error => console.log(error));
