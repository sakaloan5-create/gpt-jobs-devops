const { success } = require('../utils/response');
const adminConfigService = require('../services/adminConfig');

async function getAdminConfig(req, res, next) {
  try {
    const data = await adminConfigService.getAdminConfig();
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function updateAdminConfig(req, res, next) {
  try {
    const data = await adminConfigService.updateAdminConfig(req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAdminConfig, updateAdminConfig };
