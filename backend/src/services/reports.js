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

async function listReports({ status, page = 1, page_size = 20 }) {
  page = Math.max(1, parseInt(page, 10) || 1);
  page_size = Math.min(100, Math.max(1, parseInt(page_size, 10) || 20));

  let query = db.collection(REPORTS_COLLECTION).orderBy('created_at', 'desc');
  if (status) {
    query = query.where('status', '==', status);
  }
  const snapshot = await query.limit(page * page_size).get();
  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const start = (page - 1) * page_size;
  return {
    list: all.slice(start, start + page_size),
    pagination: { page, page_size, total: all.length, has_more: all.length > start + page_size },
  };
}

async function handleReport(reportId, { action, note, ban_job }) {
  const reportRef = db.collection(REPORTS_COLLECTION).doc(reportId);
  const reportDoc = await reportRef.get();
  if (!reportDoc.exists) {
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }

  const report = reportDoc.data();
  const update = {
    status: action === 'resolve' ? 'resolved' : 'dismissed',
    action,
    note: note || '',
    handled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await reportRef.update(update);

  // 如果需要同时下架岗位
  if (ban_job && report.job_id) {
    const jobRef = db.collection('jobs').doc(report.job_id);
    const jobDoc = await jobRef.get();
    if (jobDoc.exists) {
      await jobRef.update({ status: 'banned', updated_at: new Date().toISOString() });
    }
  }

  return { id: reportId, ...update };
}

module.exports = { createReport, listReports, handleReport };
