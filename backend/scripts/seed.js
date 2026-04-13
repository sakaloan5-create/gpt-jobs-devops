/**
 * Seed script for GigStream backend
 * Usage: node scripts/seed.js [--clear]
 *
 * Initializes:
 * - 5 mock jobs for BR, PH, ID each
 * - app_configs/default document
 * - country_configs documents
 */

const { db, admin } = require('../src/utils/firebase');

const JOBS_COLLECTION = 'jobs';
const APP_CONFIGS_DOC = 'app_configs/default';
const COUNTRY_CONFIGS_COLLECTION = 'country_configs';

function shouldClear() {
  return process.argv.includes('--clear');
}

function nowISO() {
  return new Date().toISOString();
}

function createMockJobs(country, cityBase, currency) {
  const titles = [
    'Store Promoter',
    'Warehouse Helper',
    'Delivery Partner',
    'Data Entry Clerk',
    'Customer Service Agent',
  ];

  const companies = [
    'QuickStaff',
    'City Media',
    'FastLogistics',
    'BrightSolutions',
    'HelpDesk Pro',
  ];

  return titles.map((title, idx) => {
    const company = companies[idx];
    return {
      title,
      company_name: company,
      country,
      city: `${cityBase} ${idx + 1}`,
      salary: `${currency} ${100 + idx * 20}/day`,
      job_type: 'Part-time',
      description: `${company} is looking for a reliable ${title.toLowerCase()} to join our team. Flexible hours, weekly payout. No experience needed for some roles.`,
      requirements: ['Age 18+', 'Good communication', 'Weekend availability optional'],
      responsibilities: ['Follow supervisor instructions', 'Maintain punctuality', 'Report daily progress'],
      contact_platform: country === 'PH' ? 'telegram' : 'whatsapp',
      contact_label: 'Contact Now',
      contact_link: country === 'PH'
        ? `https://t.me/${company.toLowerCase().replace(/[^a-z]/g, '')}_bot`
        : `https://wa.me/${5511999999000 + idx}?text=Hello, I am interested in ${encodeURIComponent(title)}`,
      tags: ['parttime', 'flexible', 'immediate'],
      status: 'active',
      report_enabled: true,
      created_at: nowISO(),
      updated_at: nowISO(),
    };
  });
}

async function clearCollection(collectionPath) {
  const snapshot = await db.collection(collectionPath).limit(500).get();
  const count = snapshot.docs ? snapshot.docs.length : 0;
  if (count === 0) return 0;

  // Use a batch if supported; otherwise clear one-by-one
  const col = db.collection(collectionPath);
  const hasBatchDelete = typeof db.batch === 'function' && typeof db.batch().delete === 'function';
  if (hasBatchDelete) {
    const batch = db.batch();
    for (const doc of snapshot.docs) {
      batch.delete(col.doc(doc.id));
    }
    await batch.commit();
  } else {
    for (const doc of snapshot.docs) {
      const docRef = col.doc(doc.id);
      if (typeof docRef.delete === 'function') {
        await docRef.delete();
      } else {
        await docRef.set(null);
      }
    }
  }
  return count;
}

async function seed() {
  console.log('[Seed] Starting...');

  if (shouldClear()) {
    console.log('[Seed] Clearing existing data...');
    let cleared = await clearCollection(JOBS_COLLECTION);
    console.log(`[Seed] Cleared ${cleared} jobs`);
    cleared = await clearCollection(COUNTRY_CONFIGS_COLLECTION);
    console.log(`[Seed] Cleared ${cleared} country configs`);
    const appDoc = await db.doc(APP_CONFIGS_DOC).get();
    if (appDoc.exists) {
      await db.doc(APP_CONFIGS_DOC).delete();
      console.log('[Seed] Cleared app config');
    }
  }

  // 1. Seed jobs
  const brJobs = createMockJobs('BR', 'Sao Paulo', 'BRL');
  const phJobs = createMockJobs('PH', 'Manila', 'PHP');
  const idJobs = createMockJobs('ID', 'Jakarta', 'IDR');
  const allJobs = [...brJobs, ...phJobs, ...idJobs];

  const batch = db.batch();
  for (const job of allJobs) {
    const ref = db.collection(JOBS_COLLECTION).doc();
    batch.set(ref, job);
  }
  await batch.commit();
  console.log(`[Seed] Inserted ${allJobs.length} jobs`);

  // 2. Seed app config
  await db.doc(APP_CONFIGS_DOC).set({
    search_enabled: false,
    filter_enabled: false,
    contact_enabled: true,
    report_enabled: true,
    share_enabled: false,
    version: '1.0.0',
    updated_at: nowISO(),
  });
  console.log('[Seed] Inserted app config');

  // 3. Seed country configs
  const countryConfigs = [
    { country: 'BR', fallback_order: ['BR', 'PH', 'ID'], default_language: 'pt', active: true },
    { country: 'PH', fallback_order: ['PH', 'ID', 'BR'], default_language: 'tl', active: true },
    { country: 'ID', fallback_order: ['ID', 'PH', 'BR'], default_language: 'id', active: true },
  ];

  const cBatch = db.batch();
  for (const cfg of countryConfigs) {
    const ref = db.collection(COUNTRY_CONFIGS_COLLECTION).doc(cfg.country);
    cBatch.set(ref, { ...cfg, updated_at: nowISO() });
  }
  await cBatch.commit();
  console.log('[Seed] Inserted country configs');

  console.log('[Seed] Done.');
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  });
}

module.exports = { seed };
