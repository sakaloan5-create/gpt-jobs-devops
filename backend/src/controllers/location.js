const axios = require('axios');
const { success, error } = require('../utils/response');

/**
 * 通过IP获取地理位置信息
 * 使用 ipapi.co 免费服务 (每月10,000次请求)
 */
async function getLocationByIp(req, res, next) {
  try {
    // 获取客户端IP
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
      || req.headers['x-real-ip'] 
      || req.connection.remoteAddress 
      || req.socket.remoteAddress;
    
    // 本地IP返回测试数据
    if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.includes('192.168.') || clientIp.includes('10.')) {
      return success(res, {
        ip: clientIp || '127.0.0.1',
        country_code: 'CN',
        country_name: 'China',
        city: 'Local',
        region: 'Local',
        latitude: 39.9042,
        longitude: 116.4074,
        timezone: 'Asia/Shanghai',
        is_local: true
      });
    }
    
    // 调用 ipapi.co 免费服务
    try {
      const response = await axios.get(`https://ipapi.co/${clientIp}/json/`, {
        timeout: 5000
      });
      
      if (response.data && response.data.country_code) {
        return success(res, {
          ip: clientIp,
          country_code: response.data.country_code,
          country_name: response.data.country_name,
          city: response.data.city,
          region: response.data.region,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timezone: response.data.timezone,
          currency: response.data.currency,
          is_local: false
        });
      }
    } catch (apiErr) {
      console.error('ipapi.co error:', apiErr.message);
      // API调用失败时返回默认值
    }
    
    // 如果ipapi失败，返回基于IP的默认值
    return success(res, {
      ip: clientIp,
      country_code: 'US',
      country_name: 'United States',
      city: 'Unknown',
      region: 'Unknown',
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: 'America/Los_Angeles',
      is_local: false,
      fallback: true
    });
    
  } catch (err) {
    next(err);
  }
}

/**
 * 初始化时获取位置信息（供APP调用）
 */
async function getInitLocation(req, res, next) {
  try {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
      || req.headers['x-real-ip'] 
      || req.connection.remoteAddress;
    
    // 本地IP
    if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1') {
      return success(res, {
        country: 'CN',
        language: 'zh',
        timezone: 'Asia/Shanghai'
      });
    }
    
    try {
      const response = await axios.get(`https://ipapi.co/${clientIp}/json/`, {
        timeout: 3000
      });
      
      const countryCode = response.data?.country_code || 'US';
      const languageMap = {
        'CN': 'zh', 'TW': 'zh', 'HK': 'zh',
        'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en',
        'JP': 'ja', 'KR': 'ko',
        'DE': 'de', 'FR': 'fr', 'ES': 'es', 'IT': 'it',
        'BR': 'pt', 'PT': 'pt',
        'RU': 'ru',
        'TH': 'th', 'VN': 'vi', 'ID': 'id', 'MY': 'ms', 'PH': 'tl',
        'IN': 'hi', 'SA': 'ar', 'AE': 'ar'
      };
      
      return success(res, {
        country: countryCode,
        language: languageMap[countryCode] || 'en',
        timezone: response.data?.timezone || 'UTC',
        city: response.data?.city,
        region: response.data?.region
      });
    } catch (apiErr) {
      // 快速失败，返回默认值
      return success(res, {
        country: 'US',
        language: 'en',
        timezone: 'UTC',
        fallback: true
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLocationByIp,
  getInitLocation
};
