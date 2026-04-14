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

module.exports = {
  createEvent,
  getEventStats
};
