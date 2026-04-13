/**
 * Detect client country from request.
 * Priority:
 * 1. query.country
 * 2. headers['x-country']
 * 3. headers['x-forwarded-for'] (not resolving geoIP in MVP — would need external service)
 * 4. null
 */
function detectClientCountry(req) {
  const fromQuery = req.query && req.query.country ? req.query.country.toUpperCase() : null;
  const fromHeader = req.headers && req.headers['x-country'] ? req.headers['x-country'].toUpperCase() : null;
  return fromQuery || fromHeader || null;
}

const COUNTRY_TO_LANGUAGE = {
  BR: 'pt',
  PH: 'tl',
  ID: 'id',
  MX: 'es',
  AR: 'es',
  CO: 'es',
};

function getLanguageByCountry(country) {
  return COUNTRY_TO_LANGUAGE[(country || '').toUpperCase()] || 'en';
}

module.exports = { detectClientCountry, getLanguageByCountry };
