const { db } = require('../utils/firebase');
const { getLanguageByCountry } = require('../utils/geo');

const APP_CONFIGS_DOC = 'app_configs/default';

async function getAppConfig(clientCountry) {
  const doc = await db.doc(APP_CONFIGS_DOC).get();
  
  // 默认完整配置
  const defaultConfig = {
    // 功能开关
    search_enabled: true,
    filter_enabled: true,
    contact_enabled: true,
    report_enabled: true,
    share_enabled: true,
    submit_enabled: true,
    analytics_enabled: true,
    
    // 应用信息
    version: '1.0.0',
    min_version: '1.0.0',
    force_update: false,
    
    // 限制配置
    max_daily_submits: 10,
    max_daily_contacts: 50,
    
    // 功能配置
    countries: ['CN', 'US', 'SG', 'JP', 'GB', 'DE', 'CA', 'AU', 'OTH'],
    job_types: ['full_time', 'part_time', 'intern', 'remote'],
    contact_platforms: ['WeChat', 'WhatsApp', 'Email', 'Telegram'],
    
    // 维护模式
    maintenance_mode: false,
    maintenance_message: '系统维护中，请稍后再试',
  };
  
  // 合并数据库配置和默认配置
  const base = doc.exists ? { ...defaultConfig, ...doc.data() } : defaultConfig;
  const language = getLanguageByCountry(clientCountry);
  
  return { 
    ...base, 
    language,
    server_time: new Date().toISOString(),
    country_detected: clientCountry || null
  };
}

module.exports = { getAppConfig };
