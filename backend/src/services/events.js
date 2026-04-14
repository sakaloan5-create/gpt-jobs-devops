const { db } = require('../utils/firebase');
const admin = require('firebase-admin');

const EVENTS_COLLECTION = 'events';

async function createEvent(data) {
  const docRef = db.collection(EVENTS_COLLECTION).doc();
  const eventData = {
    device_id: data.device_id,
    event_name: data.event_name,
    event_params: data.event_params || {},
    created_at: admin.firestore.Timestamp.now(),
    client_timestamp: data.client_timestamp ? admin.firestore.Timestamp.fromDate(new Date(data.client_timestamp)) : null
  };
  
  await docRef.set(eventData);
  
  return {
    id: docRef.id,
    ...eventData
  };
}

async function getEventStats(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const snapshot = await db.collection(EVENTS_COLLECTION)
    .where('created_at', '>=', admin.firestore.Timestamp.fromDate(start))
    .where('created_at', '<=', admin.firestore.Timestamp.fromDate(end))
    .get();
  
  const stats = {
    job_list_view: 0,
    job_detail_open: 0,
    job_contact_click: 0,
    total: 0
  };
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (stats[data.event_name] !== undefined) {
      stats[data.event_name]++;
    }
    stats.total++;
  });
  
  return stats;
}

async function getJobStats(startDate, endDate, countryFilter = null) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  let query = db.collection(EVENTS_COLLECTION)
    .where('created_at', '>=', admin.firestore.Timestamp.fromDate(start))
    .where('created_at', '<=', admin.firestore.Timestamp.fromDate(end));
  
  const snapshot = await query.get();
  
  // 按国家和岗位维度统计
  const statsMap = new Map();
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const eventName = data.event_name;
    const eventParams = data.event_params || {};
    
    // 只统计 job_list_view, job_detail_open, job_contact_click
    if (!['job_list_view', 'job_detail_open', 'job_contact_click'].includes(eventName)) {
      return;
    }
    
    const country = eventParams.country || 'unknown';
    const jobId = eventParams.job_id || 'unknown';
    const jobTitle = eventParams.job_title || 'unknown';
    
    // 如果指定了国家过滤，跳过不匹配的记录
    if (countryFilter && country !== countryFilter) {
      return;
    }
    
    const key = `${country}::${jobId}`;
    
    if (!statsMap.has(key)) {
      statsMap.set(key, {
        country,
        job_id: jobId,
        job_title: jobTitle,
        job_list_view: 0,
        job_detail_open: 0,
        job_contact_click: 0
      });
    }
    
    const stats = statsMap.get(key);
    if (stats[eventName] !== undefined) {
      stats[eventName]++;
    }
  });
  
  // 转换为数组并按国家和浏览量排序
  const result = Array.from(statsMap.values()).sort((a, b) => {
    if (a.country !== b.country) {
      return a.country.localeCompare(b.country);
    }
    return b.job_list_view - a.job_list_view;
  });
  
  return {
    start_date: startDate,
    end_date: endDate,
    country_filter: countryFilter,
    total_jobs: result.length,
    jobs: result
  };
}

module.exports = {
  createEvent,
  getEventStats,
  getJobStats
};
