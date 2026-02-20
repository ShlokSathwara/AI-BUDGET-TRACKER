const app = require('./routes');
const config = require('./config');
const db = require('./utils/db');

async function start() {
  try {
    await db.connect();
    const PORT = config.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Backend server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start backend server', err);
    process.exit(1);
  }
}

start();
