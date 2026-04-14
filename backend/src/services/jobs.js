const { db } = require('../utils/firebase');
const { filterBlockedJobs } = require('../utils/filter');

const JOBS_COLLECTION = 'jobs';

async function getJobList({ country, page = 1, page_size = 20 }) {
  page = Math.max(1, parseInt(page, 10) || 1);
  page_size = Math.min(100, Math.max(1, parseInt(page_size, 10) || 20));

  const upperCountry = country ? country.toUpperCase() : null;

  let query = db
    .collection(JOBS_COLLECTION)
    .where('status', '==', 'active')
    .orderBy('created_at', 'desc');

  if (upperCountry) {
    query = query.where('country', '==', upperCountry);
  }

  const snapshot = await query.limit(page * page_size).get();
  let allJobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // 黑名单过滤
  allJobs = filterBlockedJobs(allJobs);

  // 分页
  const total = allJobs.length;
  const start = (page - 1) * page_size;
  const paginatedJobs = allJobs.slice(start, start + page_size);

  return {
    list: paginatedJobs,
    pagination: {
      page,
      page_size,
      total,
      has_more: total > start + page_size,
    },
  };
}

async function getJobDetail(jobId) {
  const doc = await db.collection(JOBS_COLLECTION).doc(jobId).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data();

  // 检查是否被黑名单拦截
  const { checkBlacklist } = require('../utils/filter');
  const fullText = [data.title, data.description, data.company_name, ...(data.tags || [])].join(' ');
  const blockResult = checkBlacklist(fullText);
  if (blockResult.blocked) {
    const err = new Error('This job has been blocked due to policy violation');
    err.status = 403;
    throw err;
  }

  return { id: doc.id, ...data };
}

module.exports = { getJobList, getJobDetail };
