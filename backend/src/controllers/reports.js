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

async function listReports(req, res, next) {
  try {
    const { status, page, page_size } = req.query;
    const data = await reportsService.listReports({ status, page, page_size });
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function handleReport(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return error(res, 'Missing required param: id', 400);
    }
    const data = await reportsService.handleReport(id, req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { createReport, listReports, handleReport };
