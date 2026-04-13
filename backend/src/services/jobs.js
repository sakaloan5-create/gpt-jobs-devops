const { db } = require('../utils/firebase');
const { filterBlockedJobs } = require('../utils/filter');
const { FALLBACK_COUNTRIES } = require('../config');

const JOBS_COLLECTION = 'jobs';
const COUNTRY_CONFIGS_COLLECTION = 'country_configs';

async function getJobList({ country, page = 1, page_size = 20 }) {
  page = Math.max(1, parseInt(page, 10) || 1);
  page_size = Math.min(100, Math.max(1, parseInt(page_size, 10) || 20));

  const upperCountry = country ? country.toUpperCase() : null;

  // 1. 读取国家配置获取兜底策略
  let fallbackOrder = FALLBACK_COUNTRIES;
  if (upperCountry) {
    const cfgDoc = await db.collection(COUNTRY_CONFIGS_COLLECTION).doc(upperCountry).get();
    if (cfgDoc.exists) {
      const cfg = cfgDoc.data();
      if (cfg.fallback_order && Array.isArray(cfg.fallback_order)) {
        fallbackOrder = cfg.fallback_order;
      }
    }
  }

  // 2. 去重后的查询国家顺序（优先目标国，其次兜底国）
  const queryOrder = upperCountry
    ? [upperCountry, ...fallbackOrder.filter((c) => c !== upperCountry)]
    : fallbackOrder;

  // 3. 逐国查询岗位
  let allJobs = [];
  const minNeeded = page_size * page;

  for (const target of queryOrder) {
    if (allJobs.length >= minNeeded) break;
    const needed = minNeeded - allJobs.length;
    const snapshot = await db
      .collection(JOBS_COLLECTION)
      .where('country', '==', target)
      .where('status', '==', 'active')
      .orderBy('created_at', 'desc')
      .limit(needed)
      .get();

    const jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    allJobs = allJobs.concat(jobs);
  }

  // 4. 黑名单过滤
  allJobs = filterBlockedJobs(allJobs);

  // 5. 分页
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
