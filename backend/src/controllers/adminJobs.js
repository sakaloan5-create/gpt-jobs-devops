const { success, error } = require('../utils/response');
const adminJobsService = require('../services/adminJobs');

async function createJob(req, res, next) {
  try {
    const data = await adminJobsService.createJob(req.body);
    return success(res, data, 201);
  } catch (err) {
    next(err);
  }
}

async function updateJob(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return error(res, 'Missing required param: id', 400);
    }
    const data = await adminJobsService.updateJob(id, req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function deleteJob(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return error(res, 'Missing required param: id', 400);
    }
    const data = await adminJobsService.deleteJob(id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function adminListJobs(req, res, next) {
  try {
    const { status, country, page, page_size } = req.query;
    const data = await adminJobsService.adminListJobs({ status, country, page, page_size });
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function reviewJob(req, res, next) {
  try {
    const { id } = req.params;
    const { action } = req.body || {};
    if (!id) {
      return error(res, 'Missing required param: id', 400);
    }
    if (!['approve', 'reject', 'ban'].includes(action)) {
      return error(res, 'Invalid action. Must be approve|reject|ban', 400);
    }
    const statusMap = { approve: 'active', reject: 'rejected', ban: 'banned' };
    const data = await adminJobsService.updateJob(id, { status: statusMap[action] });
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { createJob, updateJob, deleteJob, adminListJobs, reviewJob };
