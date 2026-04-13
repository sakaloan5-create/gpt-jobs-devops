const { success, error } = require('../utils/response');
const countriesService = require('../services/countries');

async function listCountries(req, res, next) {
  try {
    const data = await countriesService.listCountries();
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function createOrUpdateCountry(req, res, next) {
  try {
    const { code } = req.params;
    if (!code) {
      return error(res, 'Missing required param: code', 400);
    }
    const data = await countriesService.createOrUpdateCountry(code, req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function deleteCountry(req, res, next) {
  try {
    const { code } = req.params;
    if (!code) {
      return error(res, 'Missing required param: code', 400);
    }
    const data = await countriesService.deleteCountry(code);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { listCountries, createOrUpdateCountry, deleteCountry };
