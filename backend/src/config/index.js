require('dotenv').config();

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST;

const BLACKLIST_KEYWORDS = [
  '押金', '保证金', '刷单', '返利', '博彩', '陪聊', '裸聊', '代孕', '毒品', '枪支'
];

const FALLBACK_COUNTRIES = ['BR', 'PH', 'ID'];

module.exports = {
  PORT,
  NODE_ENV,
  FIREBASE_PROJECT_ID,
  FIRESTORE_EMULATOR_HOST,
  BLACKLIST_KEYWORDS,
  FALLBACK_COUNTRIES
};
