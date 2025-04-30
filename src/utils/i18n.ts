import i18n from 'i18n';
import { join } from 'path';
import Config from '@/../config/config.json';

i18n.configure({
  locales: ['en', 'ru'],
  directory: join(import.meta.dirname, '../..', 'locales'),
  defaultLocale: 'en',
  retryInDefaultLocale: true,
  objectNotation: true,
  register: global,

  logWarnFn: function (msg) {
    console.log('warn', msg);
  },

  logErrorFn: function (msg) {
    console.log('error', msg);
  },

  missingKeyFn: function (locale, value) {
    return value;
  },
  mustacheConfig: {
    tags: ['{{', '}}'],
    disable: false,
  },
});

i18n.setLocale(Config.locale);

export { i18n };
