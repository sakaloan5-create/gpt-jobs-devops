/**
 * 统一 API 响应格式 { code, message, data }
 */
function success(res, data = null, message = 'ok', code = 200) {
  return res.status(code).json({ code, message, data });
}

function error(res, message = 'error', code = 500, data = null) {
  return res.status(code).json({ code, message, data });
}

module.exports = { success, error };
