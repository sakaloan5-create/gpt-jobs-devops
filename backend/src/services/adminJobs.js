const { db } = require('../utils/firebase');
const { checkBlacklist } = require('../utils/filter');

const JOBS_COLLECTION = 'jobs';

function validateJob(data) {
  const required = ['title', 'company_name', 'country', 'salary', 'job_type', 'description', 'contact_platform', 'contact_link'];
  for (const key of required) {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      return { valid: false, message: `Missing required field: ${key}` };
    }
  }
  const fullText = [data.title, data.description, data.company_name].join(' ');
  const blockResult = checkBlacklist(fullText);
  if (blockResult.blocked) {
    return { valid: false, message: `Content contains blocked keyword: ${blockResult.keywords[0]}` };
  }
  return { valid: true };
}

function nowISO() {
  return new Date().toISOString();
}

async function createJob(data) {
  const validation = validateJob(data);
  if (!validation.valid) {
    const err = new Error(validation.message);
    err.status = 400;
    throw err;
  }

  const docRef = db.collection(JOBS_COLLECTION).doc();
  const job = {
    ...data,
    status: data.status || 'active',
    report_enabled: data.report_enabled !== false,
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  await docRef.set(job);
  return { id: docRef.id, ...job };
}

async function updateJob(jobId, data) {
  const docRef = db.collection(JOBS_COLLECTION).doc(jobId);
  const doc = await docRef.get();
  if (!doc.exists) {
    const err = new Error('Job not found');
    err.status = 404;
    throw err;
  }

  if (data.title || data.description || data.company_name) {
    const existing = doc.data();
    const fullText = [
      data.title || existing.title,
      data.description || existing.description,
      data.company_name || existing.company_name
    ].join(' ');
    const blockResult = checkBlacklist(fullText);
    if (blockResult.blocked) {
      const err = new Error(`Content contains blocked keyword: ${blockResult.keywords[0]}`);
      err.status = 400;
      throw err;
    }
  }

  const update = { ...data, updated_at: nowISO() };
  await docRef.update(update);
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() };
}

async function deleteJob(jobId) {
  const docRef = db.collection(JOBS_COLLECTION).doc(jobId);
  const doc = await docRef.get();
  if (!doc.exists) {
    const err = new Error('Job not found');
    err.status = 404;
    throw err;
  }
  await docRef.delete();
  return { id: jobId, deleted: true };
}

async function adminListJobs({ status, country, page = 1, page_size = 20 }) {
  page = Math.max(1, parseInt(page, 10) || 1);
  page_size = Math.min(100, Math.max(1, parseInt(page_size, 10) || 20));

  let query = db.collection(JOBS_COLLECTION).orderBy('created_at', 'desc');

  if (status) {
    query = query.where('status', '==', status);
  }
  if (country) {
    query = query.where('country', '==', country.toUpperCase());
  }

  // Firestore 不支持 offset + where 混合，这里简单用 limit + 客户端分页（MVP 数据量小）
  const snapshot = await query.limit(page * page_size).get();
  const allJobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const start = (page - 1) * page_size;
  const paginatedJobs = allJobs.slice(start, start + page_size);

  return {
    list: paginatedJobs,
    pagination: {
      page,
      page_size,
      total: allJobs.length,
      has_more: allJobs.length > start + page_size,
    },
  };
}

module.exports = { createJob, updateJob, deleteJob, adminListJobs };
