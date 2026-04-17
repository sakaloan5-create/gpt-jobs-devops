const { success, error } = require('../utils/response');
const eventsService = require('../services/events');

async function createEvent(req, res, next) {
  try {
    const { device_id, event_name, event_params, client_timestamp } = req.body;
    
    if (!device_id || !event_name) {
      return error(res, 'Missing required fields: device_id, event_name', 400);
    }
    
    const data = await eventsService.createEvent({
      device_id,
      event_name,
      event_params: event_params || {},
      client_timestamp: client_timestamp || null
    });
    
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function getEventStats(req, res, next) {
  try {
    let { start_date, end_date } = req.query;
    
    // 如果没有提供日期参数，默认使用最近30天
    if (!start_date || !end_date) {
      const now = new Date();
      end_date = now.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start_date = thirtyDaysAgo.toISOString().split('T')[0];
    }
    
    const data = await eventsService.getEventStats(start_date, end_date);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function getJobStats(req, res, next) {
  try {
    let { start_date, end_date, country } = req.query;
    
    // 如果没有提供日期参数，默认使用最近30天
    if (!start_date || !end_date) {
      const now = new Date();
      end_date = now.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start_date = thirtyDaysAgo.toISOString().split('T')[0];
    }
    
    const data = await eventsService.getJobStats(start_date, end_date, country);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEvent,
  getEventStats,
  getJobStats
};
