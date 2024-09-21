import { mkdirp } from 'mkdirp';
import multer from 'multer';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        mkdirp.sync(Config.api.uploadsDir);
        cb(null, Config.api.uploadsDir);
    },
    filename(req, file, cb) {
        const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.')[1]);
    },
});

export const upload = multer({ storage });
