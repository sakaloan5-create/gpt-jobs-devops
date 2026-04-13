const { success, error } = require('../utils/response');
const jobsService = require('../services/jobs');

async function listJobs(req, res, next) {
  try {
    const { country, page, page_size } = req.query;
    const data = await jobsService.getJobList({ country, page, page_size });
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function getJobDetail(req, res, next) {
  try {
    const { id } = req.query;
    if (!id) {
      return error(res, 'Missing required param: id', 400);
    }
    const data = await jobsService.getJobDetail(id);
    if (!data) {
      return error(res, 'Job not found', 404);
    }
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { listJobs, getJobDetail };
