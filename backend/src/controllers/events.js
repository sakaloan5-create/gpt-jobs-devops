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
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return error(res, 'Missing required query params: start_date, end_date', 400);
    }
    
    const data = await eventsService.getEventStats(start_date, end_date);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEvent,
  getEventStats
};
