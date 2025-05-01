import { mkdirp } from 'mkdirp';
import multer from 'multer';
import Config from '@/../config/config.json' with { type: 'json' };

const { staticDir, uploadsDir } = Config.api;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    mkdirp.sync(`${staticDir}/${uploadsDir}`);
    cb(null, `${staticDir}/${uploadsDir}`);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
    const nameParts = file.originalname.split('.');

    cb(
      null,
      file.fieldname +
        '-' +
        uniqueSuffix +
        '.' +
        nameParts[nameParts.length - 1]
    );
  },
});

export const upload = multer({ storage });
