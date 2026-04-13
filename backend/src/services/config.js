const { db } = require('../utils/firebase');
const { getLanguageByCountry } = require('../utils/geo');

const APP_CONFIGS_DOC = 'app_configs/default';

async function getAppConfig(clientCountry) {
  const doc = await db.doc(APP_CONFIGS_DOC).get();
  const base = doc.exists ? { ...doc.data() } : {
    search_enabled: false,
    filter_enabled: false,
    contact_enabled: true,
    report_enabled: true,
    share_enabled: false,
    version: '1.0.0',
  };
  const language = getLanguageByCountry(clientCountry);
  return { ...base, language };
}

module.exports = { getAppConfig };
