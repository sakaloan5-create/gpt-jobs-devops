const admin = require('firebase-admin');
const { FIREBASE_PROJECT_ID, FIRESTORE_EMULATOR_HOST, NODE_ENV } = require('../config');
const { MockFirestore } = require('./firebase-mock');

let _cachedDb = null;

function initFirebase() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  if (_cachedDb) {
    return _cachedDb;
  }

  const hasCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

  // Explicit test mode: use in-memory mock
  if (NODE_ENV === 'test') {
    console.log('[Firebase] NODE_ENV=test — using in-memory Firestore mock');
    _cachedDb = new MockFirestore();
    return _cachedDb;
  }

  // Emulator mode takes precedence for local development
  if (FIRESTORE_EMULATOR_HOST) {
    const projectId = FIREBASE_PROJECT_ID || 'gpt-jobs-dev';
    admin.initializeApp({ projectId });
    const db = admin.firestore();
    db.settings({ host: FIRESTORE_EMULATOR_HOST, ssl: false });
    console.log(`[Firebase] Using Firestore emulator at ${FIRESTORE_EMULATOR_HOST} (project: ${projectId})`);
    _cachedDb = db;
    return _cachedDb;
  }

  // Real Firebase with service-account credentials
  if (hasCredentials) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('[Firebase] Using real Firestore with application default credentials');
    _cachedDb = admin.firestore();
    return _cachedDb;
  }

  // No emulator and no credentials in non-test mode: use in-memory mock for frictionless local dev
  console.log('[Firebase] No emulator or credentials found — using in-memory Firestore mock');
  _cachedDb = new MockFirestore();
  return _cachedDb;
}

const db = initFirebase();

module.exports = { admin, db };
