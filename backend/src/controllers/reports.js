const { success, error } = require('../utils/response');
const reportsService = require('../services/reports');

async function createReport(req, res, next) {
  try {
    const { job_id, type, reason, reporter_contact } = req.body || {};
    if (!job_id) {
      return error(res, 'Missing required field: job_id', 400);
    }
    const data = await reportsService.createReport({ job_id, type, reason, reporter_contact });
    return success(res, data, 'Report submitted successfully', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { createReport };
