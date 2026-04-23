const app = require('./app');
const Database = require('./config/database');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    const db = Database.getInstance();
    await db.connect();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
