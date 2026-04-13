const { db } = require('../utils/firebase');

const REPORTS_COLLECTION = 'reports';

async function createReport({ job_id, type, reason, reporter_contact }) {
  const payload = {
    job_id: job_id || null,
    type: type || 'other',
    reason: reason || '',
    reporter_contact: reporter_contact || null,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const ref = await db.collection(REPORTS_COLLECTION).add(payload);
  return { id: ref.id, ...payload };
}

module.exports = { createReport };
