const path = require('path');
const { seed } = require('./seed');

async function main() {
  await seed();
  // Then start the server
  require(path.join(__dirname, '..', 'server.js'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
