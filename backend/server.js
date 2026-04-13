const app = require('./src/app');
const { PORT, NODE_ENV } = require('./src/config');

app.listen(PORT, () => {
  console.log(`[Server] Running in ${NODE_ENV} mode on port ${PORT}`);
});
