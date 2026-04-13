const { db } = require('../utils/firebase');

const APP_CONFIGS_DOC = 'app_configs/default';

async function getAdminConfig() {
  const doc = await db.doc(APP_CONFIGS_DOC).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : {
    id: 'default',
    search_enabled: false,
    filter_enabled: false,
    contact_enabled: true,
    report_enabled: true,
    share_enabled: false,
    version: '1.0.0',
  };
}

async function updateAdminConfig(data) {
  const docRef = db.doc(APP_CONFIGS_DOC);
  const payload = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  await docRef.set(payload, { merge: true });
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

module.exports = { getAdminConfig, updateAdminConfig };
