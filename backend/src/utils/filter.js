const { BLACKLIST_KEYWORDS } = require('../config');

/**
 * 检查文本是否包含黑名单关键词
 * @param {string} text
 * @returns {{ blocked: boolean, keywords: string[] }}
 */
function checkBlacklist(text) {
  if (!text || typeof text !== 'string') {
    return { blocked: false, keywords: [] };
  }

  const lowerText = text.toLowerCase();
  const matched = BLACKLIST_KEYWORDS.filter((kw) => lowerText.includes(kw.toLowerCase()));

  return {
    blocked: matched.length > 0,
    keywords: matched,
  };
}

function filterBlockedJobs(jobs) {
  return jobs.filter((job) => {
    const fullText = [
      job.title,
      job.description,
      job.company_name,
      ...(job.tags || []),
    ].join(' ');
    const result = checkBlacklist(fullText);
    return !result.blocked;
  });
}

module.exports = { checkBlacklist, filterBlockedJobs };
