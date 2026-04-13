const { success } = require('../utils/response');
const configService = require('../services/config');
const { detectClientCountry } = require('../utils/geo');

async function getAppConfig(req, res, next) {
  try {
    const country = detectClientCountry(req);
    const data = await configService.getAppConfig(country);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAppConfig };
