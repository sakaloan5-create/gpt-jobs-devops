const { db } = require('../utils/firebase');

const COUNTRIES_COLLECTION = 'country_configs';

async function listCountries() {
  const snapshot = await db.collection(COUNTRIES_COLLECTION).orderBy('code').get();
  return snapshot.docs.map((doc) => ({ code: doc.id, ...doc.data() }));
}

async function getCountry(code) {
  const doc = await db.collection(COUNTRIES_COLLECTION).doc(code.toUpperCase()).get();
  if (!doc.exists) return null;
  return { code: doc.id, ...doc.data() };
}

async function createOrUpdateCountry(code, data) {
  const upperCode = code.toUpperCase();
  const docRef = db.collection(COUNTRIES_COLLECTION).doc(upperCode);
  const payload = {
    ...data,
    code: upperCode,
    updated_at: new Date().toISOString(),
  };
  await docRef.set(payload, { merge: true });
  const doc = await docRef.get();
  return { code: doc.id, ...doc.data() };
}

async function deleteCountry(code) {
  const docRef = db.collection(COUNTRIES_COLLECTION).doc(code.toUpperCase());
  const doc = await docRef.get();
  if (!doc.exists) {
    const err = new Error('Country not found');
    err.status = 404;
    throw err;
  }
  await docRef.delete();
  return { code: code.toUpperCase(), deleted: true };
}

module.exports = { listCountries, getCountry, createOrUpdateCountry, deleteCountry };
