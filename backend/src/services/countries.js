const { db } = require('../utils/firebase');

const COUNTRIES_COLLECTION = 'country_configs';

// ISO 3166-1 alpha-2 默认全球国家列表（兼容旧 API，不再读取 Firestore 配置）
const DEFAULT_COUNTRIES = [
  'AF','AX','AL','DZ','AS','AD','AO','AI','AQ','AG','AR','AM','AW','AU','AT','AZ',
  'BS','BH','BD','BB','BY','BE','BZ','BJ','BM','BT','BO','BQ','BA','BW','BV','BR',
  'IO','BN','BG','BF','BI','CV','KH','CM','CA','KY','CF','TD','CL','CN','CX','CC',
  'CO','KM','CG','CD','CK','CR','CI','HR','CU','CW','CY','CZ','DK','DJ','DM','DO',
  'EC','EG','SV','GQ','ER','EE','SZ','ET','FK','FO','FJ','FI','FR','GF','PF','TF',
  'GA','GM','GE','DE','GH','GI','GR','GL','GD','GP','GU','GT','GG','GN','GW','GY',
  'HT','HM','VA','HN','HK','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','JM',
  'JP','JE','JO','KZ','KE','KI','KP','KR','KW','KG','LA','LV','LB','LS','LR','LY',
  'LI','LT','LU','MO','MG','MW','MY','MV','ML','MT','MH','MQ','MR','MU','YT','MX',
  'FM','MD','MC','MN','ME','MS','MA','MZ','MM','NA','NR','NP','NL','NC','NZ','NI',
  'NE','NG','NU','NF','MK','MP','NO','OM','PK','PW','PS','PA','PG','PY','PE','PH',
  'PN','PL','PT','PR','QA','RE','RO','RU','RW','BL','SH','KN','LC','MF','PM','VC',
  'WS','SM','ST','SA','SN','RS','SC','SL','SG','SX','SK','SI','SB','SO','ZA','GS',
  'SS','ES','LK','SD','SR','SJ','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TK',
  'TO','TT','TN','TR','TM','TC','TV','UG','UA','AE','GB','US','UM','UY','UZ','VU',
  'VE','VN','VG','VI','WF','EH','YE','ZM','ZW'
];

async function listCountries() {
  return DEFAULT_COUNTRIES.map((code) => ({ code, name: code }));
}

async function getCountry(code) {
  const upperCode = code ? code.toUpperCase() : '';
  if (DEFAULT_COUNTRIES.includes(upperCode)) {
    return { code: upperCode, name: upperCode };
  }
  return null;
}

async function createOrUpdateCountry(code, data) {
  const upperCode = code.toUpperCase();
  const docRef = db.collection(COUNTRIES_COLLECTION).doc(upperCode);
  const payload = {
    ...data,
    code: upperCode,
    updated_at: new Date().toISOString(),
  };
  await docRef.set(payload, { merge: true });
  const doc = await docRef.get();
  return { code: doc.id, ...doc.data() };
}

async function deleteCountry(code) {
  const docRef = db.collection(COUNTRIES_COLLECTION).doc(code.toUpperCase());
  const doc = await docRef.get();
  if (!doc.exists) {
    const err = new Error('Country not found');
    err.status = 404;
    throw err;
  }
  await docRef.delete();
  return { code: code.toUpperCase(), deleted: true };
}

module.exports = { listCountries, getCountry, createOrUpdateCountry, deleteCountry };
